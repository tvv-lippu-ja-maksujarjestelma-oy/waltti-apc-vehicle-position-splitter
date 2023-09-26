import type pino from "pino";
import type Pulsar from "pulsar-client";
import { transit_realtime } from "./protobuf/gtfsRealtime";
import {
  buildUpCache,
  buildAcceptedVehicles,
  getUniqueVehicleId,
  getFeedDetails,
  addMessageToCache,
  updateAcceptedVehicles,
} from "./cacheBuilding";
import type {
  UniqueVehicleId,
  IsServicing,
  LatestSentTimestamp,
  AcceptedVehicles,
  VehicleStateCache,
  ProcessingConfig,
  CacheRebuildConfig,
} from "./config";

export const splitVehicles = (
  logger: pino.Logger,
  gtfsrtMessage: transit_realtime.FeedMessage,
  feedPublisherId: string,
  acceptedVehicles: AcceptedVehicles,
  vehicleStateCache: VehicleStateCache,
  mainHeader: transit_realtime.IFeedHeader,
  originMessageId: string,
  sendCallback: (
    fullApcMessage: Pulsar.ProducerMessage
  ) => Promise<Pulsar.MessageId>,
  vehiclesInMessage: Set<UniqueVehicleId>,
  gtfsrtPulsarMessage: Pulsar.Message,
  promises: Promise<Pulsar.MessageId>[]
): void => {
  if (acceptedVehicles.size === 0) {
    logger.warn(
      {
        feedPublisherId,
        originMessageId,
        vehiclesInMessage: Array.from(vehiclesInMessage.values()),
        eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
      },
      "No accepted vehicles"
    );
    return;
  }

  gtfsrtMessage.entity.forEach((entity) => {
    const uniqueVehicleId = getUniqueVehicleId(entity, feedPublisherId);
    if (uniqueVehicleId == null) {
      logger.warn(
        {
          feedPublisherId,
          feedEntity: JSON.stringify(entity),
          eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
          properties: gtfsrtPulsarMessage.getProperties(),
        },
        "Could not get uniqueVehicleId from the GTFS Realtime entity"
      );
      return;
    }
    if (acceptedVehicles.has(uniqueVehicleId)) {
      // Check that this message has the newest timestamp, if not, skip it
      const vehicleCachedState = vehicleStateCache.get(uniqueVehicleId);
      const timestamp = Number(
        entity.vehicle?.timestamp ?? mainHeader.timestamp
      );
      if (vehicleCachedState != null && vehicleCachedState[0] > timestamp) {
        return;
      }

      // Create a new header for the new message
      if (
        mainHeader.gtfsRealtimeVersion == null ||
        mainHeader.incrementality == null ||
        mainHeader.timestamp == null ||
        entity.vehicle?.timestamp == null
      ) {
        logger.warn(
          {
            mainHeader,
            feedEntity: JSON.stringify(entity),
            eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
            properties: gtfsrtPulsarMessage.getProperties(),
          },
          "Could not get header from the GTFS Realtime message"
        );
        return;
      }
      const header = transit_realtime.FeedHeader.create({
        gtfsRealtimeVersion: mainHeader.gtfsRealtimeVersion,
        incrementality: mainHeader.incrementality,
        timestamp,
      });

      const feedMessage = transit_realtime.FeedMessage.create({
        entity: [entity],
        header,
      });
      const encodedFeedMessage = Buffer.from(
        transit_realtime.FeedMessage.encode(feedMessage).finish()
      );
      const pulsarMessage: Pulsar.ProducerMessage = {
        data: encodedFeedMessage,
        properties: {
          originMessageId,
        },
      };
      // Update the cache using the new message timestamp
      addMessageToCache(
        logger,
        vehicleStateCache,
        gtfsrtPulsarMessage,
        uniqueVehicleId,
        timestamp
      );
      vehiclesInMessage.add(uniqueVehicleId);
      const promise = sendCallback(pulsarMessage);
      promises.push(promise);
    }
  });
};

export const sendNotServicingMessages = (
  logger: pino.Logger,
  vehicleStateCache: VehicleStateCache,
  vehiclesInMessage: AcceptedVehicles,
  mainHeader: transit_realtime.IFeedHeader,
  originMessageId: string,
  sendCallback: (
    fullApcMessage: Pulsar.ProducerMessage
  ) => Promise<Pulsar.MessageId>,
  promises: Promise<Pulsar.MessageId>[]
): void => {
  if (vehicleStateCache.size === 0) {
    logger.debug(
      {
        vehicleStateCache: JSON.stringify(vehicleStateCache),
        vehiclesInMessage: JSON.stringify(vehiclesInMessage),
        mainHeader: JSON.stringify(mainHeader),
        originMessageId,
      },
      "No vehicles in cache"
    );
    return;
  }
  vehicleStateCache.forEach((value, key) => {
    if (value[1] && !vehiclesInMessage.has(key)) {
      vehicleStateCache.set(key, [value[0], false]);

      logger.info(
        {
          uniqueVehicleId: key,
          latestSentTimestamp: value[0],
          timestamp: mainHeader.timestamp,
        },
        "Vehicle is not servicing, setting to false"
      );
      // send one VP message for each missing vehicle onwards, where the sent VP message only has the VehicleDescriptor part. This time copy the header timestamp to vehicle timestamp
      if (
        mainHeader.gtfsRealtimeVersion == null ||
        mainHeader.incrementality == null ||
        mainHeader.timestamp == null
      ) {
        logger.warn(
          { mainHeader },
          "Could not get header from the GTFS Realtime message"
        );
        return;
      }
      const header = transit_realtime.FeedHeader.create({
        gtfsRealtimeVersion: mainHeader.gtfsRealtimeVersion,
        incrementality: mainHeader.incrementality,
        timestamp: mainHeader.timestamp,
      });

      const feedMessage = transit_realtime.FeedMessage.create({
        entity: [
          transit_realtime.FeedEntity.create({
            id: key,
            vehicle: transit_realtime.VehiclePosition.create({
              timestamp: mainHeader.timestamp,
              vehicle: transit_realtime.VehicleDescriptor.create({
                id: key,
              }),
            }),
          }),
        ],
        header,
      });
      const encodedFeedMessage = Buffer.from(
        transit_realtime.FeedMessage.encode(feedMessage).finish()
      );
      const pulsarMessage: Pulsar.ProducerMessage = {
        data: encodedFeedMessage,
        properties: {
          originMessageId: originMessageId.toString(),
          isServicing: "false",
        },
      };
      const promise = sendCallback(pulsarMessage);
      promises.push(promise);
    }
  });
};

export const initializeSplitting = async (
  logger: pino.Logger,
  cacheReader: Pulsar.Reader,
  vehicleReader: Pulsar.Reader,
  { feedMap }: ProcessingConfig,
  { cacheWindowInSeconds }: CacheRebuildConfig
) => {
  const vehicleStateCache: VehicleStateCache = new Map<
    UniqueVehicleId,
    [LatestSentTimestamp, IsServicing]
  >();
  const acceptedVehicles: AcceptedVehicles = new Set<UniqueVehicleId>();
  logger.info("Initializing splitting");

  await buildAcceptedVehicles(
    logger,
    acceptedVehicles,
    vehicleReader,
    cacheWindowInSeconds,
    feedMap
  );

  await buildUpCache(
    logger,
    vehicleStateCache,
    cacheReader,
    cacheWindowInSeconds,
    feedMap
  );

  const updateVehicleRegistryCache = (vrPulsarMessage: Pulsar.Message) => {
    updateAcceptedVehicles(logger, vrPulsarMessage, feedMap, acceptedVehicles);
  };

  const splitVehiclesAndSend = (
    gtfsrtPulsarMessage: Pulsar.Message,
    sendCallback: (
      fullApcMessage: Pulsar.ProducerMessage
    ) => Promise<Pulsar.MessageId>,
    acknowledgeMessage: () => void
  ): void => {
    const promises: Promise<Pulsar.MessageId>[] = [];
    const vehiclesInMessage: Set<UniqueVehicleId> = new Set<UniqueVehicleId>();
    let gtfsrtMessage;
    try {
      gtfsrtMessage = transit_realtime.FeedMessage.decode(
        gtfsrtPulsarMessage.getData()
      );
    } catch (err) {
      logger.warn(
        { err },
        "The GTFS Realtime message does not conform to the proto definition"
      );
      return;
    }

    const pulsarTopic = gtfsrtPulsarMessage.getTopicName();
    const feedDetails = getFeedDetails(feedMap, pulsarTopic);
    const mainHeader = gtfsrtMessage.header;
    const originMessageId = gtfsrtPulsarMessage.getMessageId();

    if (feedDetails === undefined) {
      logger.warn(
        {
          pulsarTopic,
          feedMap: [...feedMap.entries()],
          gtfsrtMessage: JSON.stringify(gtfsrtMessage),
          eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
          properties: { ...gtfsrtPulsarMessage.getProperties() },
        },
        "Could not get feed details from the Pulsar topic name"
      );
      return;
    }

    logger.debug(
      {
        pulsarTopic,
        gtfsrtMessage: JSON.stringify(gtfsrtMessage),
        eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
        properties: gtfsrtPulsarMessage.getProperties(),
        nEntity: gtfsrtMessage.entity.length,
      },
      "Handle each GTFS Realtime entity"
    );

    splitVehicles(
      logger,
      gtfsrtMessage,
      feedDetails.feedPublisherId,
      acceptedVehicles,
      vehicleStateCache,
      mainHeader,
      originMessageId.toString(),
      sendCallback,
      vehiclesInMessage,
      gtfsrtPulsarMessage,
      promises
    );

    // Loop through the cache and set vehicles that have not been seen in the message to false
    sendNotServicingMessages(
      logger,
      vehicleStateCache,
      vehiclesInMessage,
      mainHeader,
      originMessageId.toString(),
      sendCallback,
      promises
    );
    Promise.all(promises)
      .then((results) => {
        if (
          results.some(
            (result: Pulsar.MessageId) => result.toString() === undefined
          )
        ) {
          const messageIds = results.map((result) => result.toString());
          logger.fatal(
            { results, messageIds, originMessageId, pulsarTopic },
            "Some messages were not sent"
          );
          throw new Error("Some messages were not sent");
        } else {
          acknowledgeMessage();
        }
      })
      .catch(() => {
        logger.fatal(
          { originMessageId, pulsarTopic, promises },
          "Some messages were not sent"
        );
        throw new Error("Some messages were not sent");
      });
  };

  return {
    updateVehicleRegistryCache,
    splitVehiclesAndSend,
  };
};

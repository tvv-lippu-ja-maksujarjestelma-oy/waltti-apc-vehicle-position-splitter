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
  sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void,
  vehiclesInMessage: Set<UniqueVehicleId>,
  gtfsrtPulsarMessage: Pulsar.Message
): void => {
  gtfsrtMessage.entity.forEach((entity) => {
    const uniqueVehicleId = getUniqueVehicleId(entity, feedPublisherId);
    if (uniqueVehicleId == null) {
      logger.warn(
        { feedPublisherId, feedEntity: JSON.stringify(entity) },
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
          { mainHeader },
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
      sendCallback(pulsarMessage);
    }
  });
};

export const sendNotServicingMessages = (
  logger: pino.Logger,
  vehicleStateCache: VehicleStateCache,
  vehiclesInMessage: AcceptedVehicles,
  mainHeader: transit_realtime.IFeedHeader,
  originMessageId: string,
  sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void
): void => {
  vehicleStateCache.forEach((value, key) => {
    if (value[1] && !vehiclesInMessage.has(key)) {
      vehicleStateCache.set(key, [value[0], false]);

      logger.info(
        {
          uniqueVehicleId: key,
          latestSentTimestamp: value[0],
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
          notServicing: "true",
        },
      };
      sendCallback(pulsarMessage);
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

  await buildUpCache(
    logger,
    vehicleStateCache,
    cacheReader,
    cacheWindowInSeconds,
    feedMap
  );

  await buildAcceptedVehicles(
    logger,
    acceptedVehicles,
    vehicleReader,
    cacheWindowInSeconds,
    feedMap
  );

  const updateVehicleRegistryCache = (vrPulsarMessage: Pulsar.Message) => {
    updateAcceptedVehicles(logger, vrPulsarMessage, feedMap, acceptedVehicles);
  };

  const splitVehiclesAndSend = (
    gtfsrtPulsarMessage: Pulsar.Message,
    sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void
  ): void => {
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
        { pulsarTopic, gtfsrtMessage: JSON.stringify(gtfsrtMessage) },
        "Could not get feed details from the Pulsar topic name"
      );
      return;
    }
    logger.debug(
      { nEntity: gtfsrtMessage.entity.length },
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
      gtfsrtPulsarMessage
    );

    // Loop through the cache and set vehicles that have not been seen in the message to false
    sendNotServicingMessages(
      logger,
      vehicleStateCache,
      vehiclesInMessage,
      mainHeader,
      originMessageId.toString(),
      sendCallback
    );
  };

  return {
    updateVehicleRegistryCache,
    splitVehiclesAndSend,
  };
};

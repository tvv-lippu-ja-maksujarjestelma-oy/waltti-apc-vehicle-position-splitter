import type pino from "pino";
import type Pulsar from "pulsar-client";
import { transit_realtime } from "./protobuf/gtfsRealtime";
import * as VehicleApcMapping from "./quicktype/vehicle-apc-mapping";
import {
  buildUpCache,
  buildAcceptedVehicles,
  getUniqueVehicleId,
  getUniqueVehicleIdFromVehicleApcMapping,
  getFeedDetails,
} from "./cacheBuilding";
import type {
  UniqueVehicleId,
  IsServicing,
  LatestSentTimestamp,
  AcceptedVehicles,
  VehicleStateCache,
  ProcessingConfig,
} from "./config";

export const splitVehicles = (
  logger: pino.Logger,
  gtfsrtMessage: transit_realtime.FeedMessage,
  feedPublisherId: string,
  AcceptedVehicles: AcceptedVehicles,
  VehicleStateCache: VehicleStateCache,
  mainHeader: transit_realtime.IFeedHeader,
  originMessageId: string,
  sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void,
  vehiclesInMessage: AcceptedVehicles
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
    if (AcceptedVehicles.has(uniqueVehicleId)) {
      // Check that this message has the newest timestamp, if not, skip it
      const vehicleState = VehicleStateCache.get(uniqueVehicleId);
      if (
        !(
          vehicleState == null ||
          vehicleState[0] <
            Number(entity.vehicle?.timestamp ?? mainHeader.timestamp)
        )
      ) {
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
        timestamp: entity.vehicle?.timestamp ?? mainHeader.timestamp,
      });

      const FeedMessage = transit_realtime.FeedMessage.create({
        entity: [entity],
        header,
      });
      const encodedFeedMessage = Buffer.from(
        JSON.stringify(FeedMessage),
        "utf8"
      );
      const pulsarMessage: Pulsar.ProducerMessage = {
        data: encodedFeedMessage,
        properties: {
          originMessageId,
        },
      };
      // Update the cache using the new message timestamp
      VehicleStateCache.set(uniqueVehicleId, [
        Number(entity.vehicle?.timestamp ?? mainHeader.timestamp),
        true,
      ]);
      vehiclesInMessage.add(uniqueVehicleId);
      sendCallback(pulsarMessage);
    }
  });
};

export const sendNotServicingMessages = (
  logger: pino.Logger,
  VehicleStateCache: VehicleStateCache,
  vehiclesInMessage: AcceptedVehicles,
  mainHeader: transit_realtime.IFeedHeader,
  originMessageId: string,
  sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void
): void => {
  VehicleStateCache.forEach((value, key) => {
    if (value[1] && !vehiclesInMessage.has(key)) {
      VehicleStateCache.set(key, [value[0], false]);

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

      const FeedMessage = transit_realtime.FeedMessage.create({
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
        JSON.stringify(FeedMessage),
        "utf8"
      );
      const pulsarMessage: Pulsar.ProducerMessage = {
        data: encodedFeedMessage,
        properties: {
          originMessageId: originMessageId.toString(),
          notServicing: "true",
        },
      };
      console.log(pulsarMessage);
      sendCallback(pulsarMessage);
    }
  });
};

export const initializeSplitting = async (
  logger: pino.Logger,
  cacheReader: Pulsar.Reader,
  vehicleReader: Pulsar.Reader,
  { feedMap }: ProcessingConfig
) => {
  const VehicleStateCache: VehicleStateCache = new Map<
    UniqueVehicleId,
    [LatestSentTimestamp, IsServicing]
  >();
  const AcceptedVehicles: AcceptedVehicles = new Set<UniqueVehicleId>();

  // Two days in seconds
  const cacheWindowInSeconds = 2 * 24 * 60 * 60;
  await buildUpCache(
    logger,
    VehicleStateCache,
    cacheReader,
    cacheWindowInSeconds,
    feedMap
  );

  await buildAcceptedVehicles(
    logger,
    AcceptedVehicles,
    vehicleReader,
    cacheWindowInSeconds,
    feedMap
  );

  const updateVehicleRegistry = (apcPulsarMessage: Pulsar.Message) => {
    const dataString = apcPulsarMessage.getData().toString("utf8");
    let vehicleApcMessage;
    try {
      vehicleApcMessage =
        VehicleApcMapping.Convert.toVehicleApcMapping(dataString);
    } catch (err) {
      logger.warn(
        {
          err,
          apcPulsarMessage: JSON.stringify(apcPulsarMessage),
          apcPulsarMessageDataString: dataString,
        },
        "Could not parse vehicleApcMessage"
      );
    }
    // Update AcceptedVehicles
    if (vehicleApcMessage != null) {
      const pulsarTopic = apcPulsarMessage.getTopicName();
      const feedPublisherId = getFeedDetails(
        feedMap,
        pulsarTopic
      )?.feedPublisherId;
      if (feedPublisherId == null) {
        logger.warn(
          {
            apcPulsarMessage: JSON.stringify(apcPulsarMessage),
            apcPulsarMessageDataString: dataString,
          },
          "Could not get feedPublisherId from the Pulsar topic name"
        );
        return;
      }
      const uniqueVehicleId = getUniqueVehicleIdFromVehicleApcMapping(
        vehicleApcMessage,
        feedPublisherId
      );
      if (uniqueVehicleId != null) {
        AcceptedVehicles.add(uniqueVehicleId);
      }
    }
  };

  const splitVehiclesAndSend = (
    gtfsrtPulsarMessage: Pulsar.Message,
    sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void
  ): void => {
    const vehiclesInMessage: AcceptedVehicles = new Set<UniqueVehicleId>();
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
      AcceptedVehicles,
      VehicleStateCache,
      mainHeader,
      originMessageId.toString(),
      sendCallback,
      vehiclesInMessage
    );

    // Loop through the cache and set vehicles that have not been seen in the message to false
    sendNotServicingMessages(
      logger,
      VehicleStateCache,
      vehiclesInMessage,
      mainHeader,
      originMessageId.toString(),
      sendCallback
    );
  };

  return {
    updateVehicleRegistry,
    splitVehiclesAndSend,
  };
};

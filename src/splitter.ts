import type pino from "pino";
import type Pulsar from "pulsar-client";
import { transit_realtime } from "./protobuf/gtfsRealtime";
import * as VehicleApcMapping from "./quicktype/vehicle-apc-mapping";
import { buildUpCache, buildAcceptedVehicles } from "./cacheBuilding";
import type {
  UniqueVehicleId,
  IsServicing,
  LatestSentTimestamp,
  AcceptedVehicles,
  VehicleStateCache,
  FeedPublisherMap,
  ProcessingConfig,
  FeedPublisherId,
  PulsarTopic,
} from "./config";

export const getUniqueVehicleId = (
  entity: transit_realtime.IFeedEntity,
  feedPublisherId: string
): UniqueVehicleId | undefined => {
  let result: UniqueVehicleId | undefined;
  const vehicleId = entity.vehicle?.vehicle?.id;
  if (vehicleId != null) {
    result = `${feedPublisherId}:${vehicleId}`;
  }
  return result;
};

export const getUniqueVehicleIdFromVehicleApcMapping = (
  vehicleApcMapping: VehicleApcMapping.VehicleApcMapping,
  feedPublisherId: string
): UniqueVehicleId | undefined => {
  let result: UniqueVehicleId | undefined;
  const { operatorId } = vehicleApcMapping;
  const { vehicleShortName } = vehicleApcMapping;
  if (operatorId != null && vehicleShortName != null) {
    result = `${feedPublisherId}:${operatorId}_${vehicleShortName}`;
  }
  return result;
};

export const getFeedDetails = (
  feedMap: FeedPublisherMap,
  topic: PulsarTopic
):
  | {
      feedPublisherId: FeedPublisherId;
    }
  | undefined => {
  let result;
  const feedPublisherId = feedMap.get(topic);
  if (feedPublisherId !== undefined) {
    result = {
      feedPublisherId,
    };
  }
  return result;
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

    gtfsrtMessage.entity.forEach((entity) => {
      const uniqueVehicleId = getUniqueVehicleId(
        entity,
        feedDetails.feedPublisherId
      );
      if (uniqueVehicleId == null) {
        logger.warn(
          { feedDetails, feedEntity: JSON.stringify(entity) },
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
            originMessageId: originMessageId.toString(),
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

    // Loop through the cache and set vehicles that have not been seen in the message to false
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
        sendCallback(pulsarMessage);
      }
    });
  };

  return {
    updateVehicleRegistry,
    splitVehiclesAndSend,
  };
};

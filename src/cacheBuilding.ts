import type pino from "pino";
import type Pulsar from "pulsar-client";
import { Long } from "protobufjs";
import type {
  UniqueVehicleId,
  PulsarTopic,
  FeedPublisherId,
  AcceptedVehicles,
  VehicleStateCache,
  FeedPublisherMap,
} from "./config";
import { transit_realtime } from "./protobuf/gtfsRealtime";
import * as VehicleApcMapping from "./quicktype/vehicle-apc-mapping";

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

export const getUniqueVehicleIdFromVehicleApcMapping = (
  vehicleApcMapping: VehicleApcMapping.VehicleApcMapping,
  feedPublisherId: string
): UniqueVehicleId | undefined => {
  let result: UniqueVehicleId | undefined;
  const { operatorId, vehicleShortName } = vehicleApcMapping;
  if (operatorId != null && vehicleShortName != null) {
    result = `${feedPublisherId}:${operatorId}_${vehicleShortName}`;
  }
  return result;
};

export const addMessageToCache = (
  logger: pino.Logger,
  cache: VehicleStateCache,
  cacheMessage: Pulsar.Message,
  uniqueVehicleId: UniqueVehicleId,
  timestamp: number | Long
): void => {
  const notServicing =
    cacheMessage.getProperties()?.["isServicing"] === "false";

  const cacheEntry = cache.get(uniqueVehicleId);
  if (cacheEntry != null) {
    if (cacheEntry[0] < Number(timestamp)) {
      cache.set(uniqueVehicleId, [Number(timestamp), !notServicing]);
    } else {
      logger.error(
        {
          cacheMessage: JSON.stringify(cacheMessage),
          cacheEntry: JSON.stringify(cacheEntry),
          timestamp: Number(timestamp),
          eventTimestamp: cacheMessage.getEventTimestamp(),
          properties: cacheMessage.getProperties(),
        },
        "Cache entry is newer than the message"
      );
    }
  } else {
    cache.set(uniqueVehicleId, [Number(timestamp), !notServicing]);
  }
};

export const buildUpCache = async (
  logger: pino.Logger,
  cache: VehicleStateCache,
  cacheReader: Pulsar.Reader,
  cacheWindowInSeconds: number,
  feedmap: FeedPublisherMap
): Promise<void> => {
  const now = Date.now();
  const startTime = now - cacheWindowInSeconds * 1000;
  await cacheReader.seekTimestamp(startTime);
  while (cacheReader.hasNext()) {
    // eslint-disable-next-line no-await-in-loop
    const cacheMessage = await cacheReader.readNext();
    const dataString = cacheMessage.getData().toString("utf8");
    let feedMessage: transit_realtime.FeedMessage;
    try {
      feedMessage = transit_realtime.FeedMessage.decode(cacheMessage.getData());
    } catch (err) {
      logger.warn(
        {
          err,
          cacheMessage: JSON.stringify(cacheMessage),
          cacheMessageDataString: dataString,
          eventTimestamp: cacheMessage.getEventTimestamp(),
          properties: cacheMessage.getProperties(),
        },
        "Could not parse cacheMessage"
      );
      return;
    }
    if (feedMessage.entity[0] == null) {
      logger.warn(
        {
          cacheMessage: JSON.stringify(cacheMessage),
          cacheMessageDataString: dataString,
          eventTimestamp: cacheMessage.getEventTimestamp(),
          properties: cacheMessage.getProperties(),
        },
        "Cache message does not contain a feed entity"
      );
      return;
    }
    // Parse message and add to cache
    const pulsarTopic = cacheMessage.getTopicName();
    const timestamp =
      feedMessage.entity[0].vehicle?.timestamp || feedMessage.header.timestamp;
    const feedDetails = getFeedDetails(feedmap, pulsarTopic);

    if (feedDetails == null) {
      logger.warn(
        {
          cacheMessage: JSON.stringify(cacheMessage),
          cacheMessageDataString: dataString,
        },
        "Could not get feed details from the Pulsar topic name"
      );
      return;
    }
    const uniqueVehicleId = getUniqueVehicleId(
      feedMessage.entity[0],
      feedDetails.feedPublisherId
    );
    // Add to cache
    if (uniqueVehicleId != null && timestamp != null) {
      addMessageToCache(
        logger,
        cache,
        cacheMessage,
        uniqueVehicleId,
        timestamp
      );
    } else {
      logger.warn(
        {
          cacheMessage: JSON.stringify(cacheMessage),
          cacheMessageDataString: dataString,
        },
        "Could not get uniqueVehicleId or timestamp from the cacheMessage"
      );
    }
  }
};

export const updateAcceptedVehicles = (
  logger: pino.Logger,
  cacheMessage: Pulsar.Message,
  feedMap: FeedPublisherMap,
  acceptedVehicles: AcceptedVehicles
): void => {
  const dataString = cacheMessage.getData().toString("utf8");
  let vehicleApcMessage;
  try {
    vehicleApcMessage =
      VehicleApcMapping.Convert.toVehicleApcMapping(dataString);
  } catch (err) {
    logger.warn(
      {
        err,
        apcPulsarMessage: JSON.stringify(cacheMessage),
        apcPulsarMessageDataString: dataString,
      },
      "Could not parse vehicleApcMessage"
    );
  }
  // Update acceptedVehicles
  if (vehicleApcMessage != null) {
    const pulsarTopic = cacheMessage.getTopicName();
    const feedPublisherId = getFeedDetails(
      feedMap,
      pulsarTopic
    )?.feedPublisherId;
    if (feedPublisherId == null) {
      logger.warn(
        {
          apcPulsarMessage: JSON.stringify(cacheMessage),
          apcPulsarMessageDataString: dataString,
        },
        "Could not get feedPublisherId from the Pulsar topic name"
      );
      return;
    }
    acceptedVehicles.clear();
    vehicleApcMessage.forEach((vehicle) => {
      const uniqueVehicleId = getUniqueVehicleIdFromVehicleApcMapping(
        vehicle,
        feedPublisherId
      );
      if (uniqueVehicleId != null) {
        acceptedVehicles.add(uniqueVehicleId);
      }
    });
  }
};

export const buildAcceptedVehicles = async (
  logger: pino.Logger,
  acceptedVehicles: AcceptedVehicles,
  vehicleReader: Pulsar.Reader,
  cacheWindowInSeconds: number,
  feedMap: FeedPublisherMap
): Promise<void> => {
  const now = Date.now();

  const startTime = now - cacheWindowInSeconds * 1000;
  await vehicleReader.seekTimestamp(startTime);
  let cacheMessage = await vehicleReader.readNext();
  while (vehicleReader.hasNext()) {
    // eslint-disable-next-line no-await-in-loop
    cacheMessage = await vehicleReader.readNext();
  }
  updateAcceptedVehicles(logger, cacheMessage, feedMap, acceptedVehicles);
};

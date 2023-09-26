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
      if (cacheEntry[1] !== notServicing) {
        logger.debug(
          {
            uniqueVehicleId,
            cacheEntry: JSON.stringify(cacheEntry),
            timestamp: Number(timestamp),
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
          },
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Vehicle has changed servicing status to ${!notServicing}`
        );
      }
    } else if (cacheEntry[0] > Number(timestamp)) {
      logger.debug(
        {
          cacheEntryTimeStamp: new Date(cacheEntry[0] * 1000).toString(),
          messageTimestamp: new Date(Number(timestamp) * 1000).toString(),
          eventTimestamp: cacheMessage.getEventTimestamp(),
          properties: { ...cacheMessage.getProperties() },
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
  try {
    await cacheReader.seekTimestamp(startTime);
    logger.info("Building up cache");
    if (!cacheReader.hasNext()) {
      logger.info("No message found, increasing start time");
      await cacheReader.seekTimestamp(now - cacheWindowInSeconds * 1000 * 7);
    }

    while (cacheReader.hasNext()) {
      // eslint-disable-next-line no-await-in-loop
      const cacheMessage = await cacheReader.readNext();
      const dataString = cacheMessage.getData().toString("utf8");
      let feedMessage: transit_realtime.FeedMessage;
      try {
        feedMessage = transit_realtime.FeedMessage.decode(
          cacheMessage.getData()
        );
      } catch (err) {
        logger.warn(
          {
            err,
            cacheMessageDataString: dataString,
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
          },
          "Could not parse cacheMessage"
        );
        return;
      }
      if (feedMessage.entity[0] == null) {
        logger.warn(
          {
            cacheMessageDataString: dataString,
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
          },
          "Cache message does not contain a feed entity"
        );
        return;
      }
      // Parse message and add to cache
      const pulsarTopic = cacheMessage.getTopicName();
      const timestamp =
        feedMessage.entity[0].vehicle?.timestamp ||
        feedMessage.header.timestamp;
      const feedDetails = getFeedDetails(feedmap, pulsarTopic);
      if (feedDetails == null) {
        logger.warn(
          {
            cacheMessageDataString: dataString,
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
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
            cacheMessageDataString: dataString,
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
          },
          "Could not get uniqueVehicleId or timestamp from the cacheMessage"
        );
      }
    }
    logger.info(
      {
        cacheSize: cache.size,
        eventTimestamp: Date.now(),
        feedmap: [...feedmap.entries()],
      },
      "Finished building up cache"
    );
  } catch (err) {
    logger.error(
      {
        err,
        eventTimestamp: Date.now(),
        feedmap: [...feedmap.entries()],
      },
      "Error building up cache"
    );
  }
  logger.info({ cacheSize: cache.size }, "Cache built");
};

export const updateAcceptedVehicles = (
  logger: pino.Logger,
  cacheMessage: Pulsar.Message,
  feedMap: FeedPublisherMap,
  acceptedVehicles: AcceptedVehicles
): void => {
  const dataString = cacheMessage.getData().toString("utf8");
  const oldAcceptedVehicles = new Set(acceptedVehicles);
  logger.info("Updating accepted vehicles");
  let splittedVehicleMessage;
  try {
    splittedVehicleMessage =
      VehicleApcMapping.Convert.toVehicleApcMapping(dataString);
  } catch (err) {
    logger.warn(
      {
        err,
        vrPulsarMessageDataString: dataString,
        eventTimestamp: cacheMessage.getEventTimestamp(),
        properties: { ...cacheMessage.getProperties() },
      },
      "Could not parse vehicleRegistryMessage"
    );
  }
  // Update acceptedVehicles
  if (splittedVehicleMessage != null) {
    const pulsarTopic = cacheMessage.getTopicName();
    const feedPublisherId = getFeedDetails(
      feedMap,
      pulsarTopic
    )?.feedPublisherId;
    if (feedPublisherId == null) {
      logger.warn(
        {
          pulsarTopic,
          feedMap: [...feedMap.entries()],
          apcPulsarMessageDataString: dataString,
          eventTimestamp: cacheMessage.getEventTimestamp(),
          properties: { ...cacheMessage.getProperties() },
        },
        "Could not get feedPublisherId from the Pulsar topic name"
      );
      return;
    }
    acceptedVehicles.clear();
    splittedVehicleMessage.forEach((vehicle) => {
      const uniqueVehicleId = getUniqueVehicleIdFromVehicleApcMapping(
        vehicle,
        feedPublisherId
      );
      if (
        vehicle.equipment.some(
          (equipmentItem) => equipmentItem.type === "PASSENGER_COUNTER"
        ) &&
        uniqueVehicleId != null
      ) {
        acceptedVehicles.add(uniqueVehicleId);
        logger.debug(
          {
            vehicle: VehicleApcMapping.Convert.vehicleApcMappingToJson([
              vehicle,
            ]),
            feedPublisherId,
            vrPulsarMessageDataString: dataString,
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
          },
          "Added vehicle to accepted vehicles"
        );
      } else if (uniqueVehicleId == null) {
        logger.warn(
          {
            vehicle: VehicleApcMapping.Convert.vehicleApcMappingToJson([
              vehicle,
            ]),
            feedPublisherId,
            vrPulsarMessageDataString: dataString,
            eventTimestamp: cacheMessage.getEventTimestamp(),
            properties: { ...cacheMessage.getProperties() },
          },
          "Could not get uniqueVehicleId from the splittedVehicleMessage"
        );
      }
    });

    if (acceptedVehicles.size === 0) {
      logger.warn(
        {
          acceptedVehicles: Array.from(acceptedVehicles.values()),
          oldAcceptedVehicles: Array.from(oldAcceptedVehicles.values()),
          eventTimestamp: cacheMessage.getEventTimestamp(),
        },
        "No accepted vehicles"
      );
    } else {
      logger.debug(
        {
          acceptedVehicles: Array.from(acceptedVehicles.values()),
          oldAcceptedVehicles: Array.from(oldAcceptedVehicles.values()),
          eventTimestamp: cacheMessage.getEventTimestamp(),
        },
        "Updated accepted vehicles"
      );
    }
  } else {
    logger.warn(
      {
        vrPulsarMessageDataString: dataString,
        eventTimestamp: cacheMessage.getEventTimestamp(),
        properties: { ...cacheMessage.getProperties() },
      },
      "Could not parse vehicleRegistryMessage"
    );
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
  logger.info("Building up accepted vehicles");
  await vehicleReader.seekTimestamp(startTime);
  let cacheMessage = await vehicleReader.readNext();
  // IF there is no message, try bu increasing the start time
  if (cacheMessage == null) {
    logger.info("No message found, increasing start time");
    await vehicleReader.seekTimestamp(now - cacheWindowInSeconds * 1000 * 7);
    cacheMessage = await vehicleReader.readNext();
  }
  while (vehicleReader.hasNext()) {
    // eslint-disable-next-line no-await-in-loop
    cacheMessage = await vehicleReader.readNext();
  }
  updateAcceptedVehicles(logger, cacheMessage, feedMap, acceptedVehicles);
};

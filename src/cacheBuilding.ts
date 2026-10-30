import type pino from "pino";
import type Pulsar from "pulsar-client";
import { Long } from "protobufjs";
import type { RegistryReader } from "./registryReader";

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
  const feedPublisherId =
    feedMap.get(topic) ??
    feedMap.get(topic.replace("/splitted-", "/")) ??
    (topic.length === 0 && feedMap.size === 1
      ? feedMap.values().next().value
      : undefined);
  if (feedPublisherId !== undefined) {
    result = {
      feedPublisherId,
    };
  }
  return result;
};

const getMessageLogContext = (message: Pulsar.Message) => ({
  pulsarTopic: message.getTopicName(),
  messageID: message.getMessageId().toString(),
  dataSize: message.getData().length,
  eventTimestamp: message.getEventTimestamp(),
  publishTimestamp: message.getPublishTimestamp?.() ?? 0,
  properties: { ...message.getProperties() },
});

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
  const start = now - cacheWindowInSeconds * 1000;

  await cacheReader.seekTimestamp(start);
  logger.info("Building up cache");

  // Before building up the deduplication cache, the cache reader is moved to the position corresponding to the start of the desired time window.
  // The following section then reads messages from the Pulsar topic starting from that position until the cache window is filled or there are no more messages.
  // Each message's relevant deduplication digests are extracted and added to the cache.
  const cutoffTs = now;

  const READ_TIMEOUT_MS = 1000; // 1s
  const MAX_CONSECUTIVE_TIMEOUTS = 3; // ~3s of emptiness → stop

  let consecutiveTimeouts = 0;

  try {
    /* eslint-disable no-await-in-loop, no-constant-condition */
    while (true) {
      try {
        const cacheMessage = await cacheReader.readNext(READ_TIMEOUT_MS);

        const publishTs = cacheMessage.getPublishTimestamp?.() ?? 0;
        const eventTs = cacheMessage.getEventTimestamp?.() ?? 0;
        const ts = publishTs > 0 ? publishTs : eventTs;
        if (ts > cutoffTs) {
          break;
        }

        let canProcess = true;
        let feedMessage: transit_realtime.FeedMessage | undefined;
        try {
          feedMessage = transit_realtime.FeedMessage.decode(
            cacheMessage.getData()
          );
        } catch (err) {
          logger.warn(
            {
              err,
              cacheMessage: getMessageLogContext(cacheMessage),
            },
            "Could not parse cacheMessage"
          );
          canProcess = false;
        }

        if (canProcess && feedMessage?.entity[0] == null) {
          logger.warn(
            {
              cacheMessage: getMessageLogContext(cacheMessage),
            },
            "Cache message does not contain a feed entity"
          );
          canProcess = false;
        }

        if (canProcess && feedMessage != null) {
          const entity0 = feedMessage.entity[0];
          if (entity0 == null) {
            logger.warn(
              {
                cacheMessage: getMessageLogContext(cacheMessage),
              },
              "Cache message does not contain a feed entity"
            );
          } else {
            const pulsarTopic = cacheMessage.getTopicName();
            const timestamp =
              entity0.vehicle?.timestamp || feedMessage.header.timestamp;
            const feedDetails = getFeedDetails(feedmap, pulsarTopic);
            if (feedDetails == null) {
              logger.warn(
                {
                  cacheMessage: getMessageLogContext(cacheMessage),
                  feedMap: [...feedmap.entries()],
                },
                "Could not get feed details from the Pulsar topic name"
              );
            } else {
              const uniqueVehicleId = getUniqueVehicleId(
                entity0,
                feedDetails.feedPublisherId
              );
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
                    cacheMessage: getMessageLogContext(cacheMessage),
                  },
                  "Could not get uniqueVehicleId or timestamp from the cacheMessage"
                );
              }
            }
          }
        }

        consecutiveTimeouts = 0;
      } catch (e) {
        const err = e as {
          name?: string;
          code?: unknown;
          message?: unknown;
        };
        const isTimeout =
          err?.name === "TimeoutError" ||
          err?.code === ("Timeout" as unknown) ||
          (typeof err?.message === "string" && /timeout/i.test(err.message));

        if (!isTimeout) throw e;

        consecutiveTimeouts += 1;
        if (consecutiveTimeouts >= MAX_CONSECUTIVE_TIMEOUTS) {
          break;
        }
      }
    }
    /* eslint-enable no-await-in-loop, no-constant-condition */
  } finally {
    logger.info(
      {
        cacheSize: cache.size,
        eventTimestamp: Date.now(),
        feedmap: [...feedmap.entries()],
      },
      "Finished building up cache"
    );
    logger.info({ cacheSize: cache.size }, "Cache built");
  }
};

export const updateAcceptedVehicles = (
  logger: pino.Logger,
  cacheMessage: Pulsar.Message,
  feedMap: FeedPublisherMap,
  acceptedVehicles: AcceptedVehicles
): boolean => {
  const dataString = cacheMessage.getData().toString("utf8");
  const oldAcceptedVehicles = new Set(acceptedVehicles);
  logger.info(
    { messageID: cacheMessage.getMessageId().toString() },
    "Updating accepted vehicles"
  );

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
  if (
    splittedVehicleMessage != null &&
    splittedVehicleMessage.some(
      (vehicle) =>
        vehicle.operatorId.length === 0 ||
        vehicle.vehicleShortName.length === 0 ||
        vehicle.equipment.length === 0 ||
        vehicle.equipment.some(
          (item) => item.type.length === 0 || item.id.length === 0
        )
    )
  ) {
    logger.warn(
      getMessageLogContext(cacheMessage),
      "Vehicle catalogue violates required identifier or equipment constraints"
    );
    return false;
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
      return false;
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
          acceptedVehiclesCount: acceptedVehicles.size,
          oldAcceptedVehiclesCount: oldAcceptedVehicles.size,
          eventTimestamp: cacheMessage.getEventTimestamp(),
        },
        "No accepted vehicles, while building up accepted vehicles"
      );
    } else {
      logger.info(
        {
          acceptedVehiclesCount: acceptedVehicles.size,
          oldAcceptedVehiclesCount: oldAcceptedVehicles.size,
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
  return splittedVehicleMessage != null;
};

export const buildAcceptedVehicles = async (
  logger: pino.Logger,
  acceptedVehicles: AcceptedVehicles,
  vehicleReader: RegistryReader,
  _cacheWindowInSeconds: number,
  feedMap: FeedPublisherMap,
  pulsarReadTimeoutMs: number
): Promise<void> => {
  // The reader starts at MessageId.earliest(). A catalogue is a full snapshot,
  // so retain only the last valid one while draining retained history.
  // Never seek by a short time window: registry polling can be six hours apart.
  const pollIntervalMs = Math.min(Math.max(pulsarReadTimeoutMs, 100), 1000);
  let initialized = false;
  const startupTimestamp = Date.now();
  logger.info("Hydrating retained vehicle catalogue");
  /* eslint-disable no-await-in-loop, no-constant-condition */
  while (true) {
    // Await also supports clients whose availability check is asynchronous.
    // Read only when available. In particular, do not repeatedly time out native
    // readNext workers while waiting for the first snapshot.
    const available = await Promise.resolve(vehicleReader.hasNext());
    if (available) {
      const message = await vehicleReader.readNext();
      const valid = updateAcceptedVehicles(
        logger,
        message,
        feedMap,
        acceptedVehicles
      );
      initialized = valid || initialized;
      // A live stream must not keep startup draining forever. The first valid
      // snapshot at/after startup is already current enough to open the gate.
      if (valid && message.getPublishTimestamp() >= startupTimestamp) {
        return;
      }
    } else if (initialized) {
      logger.info(
        { acceptedVehiclesCount: acceptedVehicles.size },
        "Catalogue hydrated"
      );
      return;
    }
    // Bound work per event-loop turn, including malformed or continuous input.
    // No positions are received or acknowledged while hydration is pending.
    const delayMs = available ? 1 : pollIntervalMs;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }
  /* eslint-enable no-await-in-loop, no-constant-condition */
};

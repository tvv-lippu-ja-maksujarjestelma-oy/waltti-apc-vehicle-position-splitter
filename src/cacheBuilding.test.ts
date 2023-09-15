import Pulsar from "pulsar-client";
import pino from "pino";
import {
  getUniqueVehicleIdFromVehicleApcMapping,
  getFeedDetails,
  getUniqueVehicleId,
  addMessageToCache,
} from "./cacheBuilding";
import type {
  FeedPublisherMap,
  PulsarTopic,
  FeedPublisherId,
  UniqueVehicleId,
  VehicleStateCache,
} from "./config";
import * as VehicleApcMapping from "./quicktype/vehicle-apc-mapping";
import { transit_realtime } from "./protobuf/gtfsRealtime";

test("Extracting unique vehicle id from vehicle apc mapping", () => {
  const vehicleApcMapping: VehicleApcMapping.VehicleApcMapping = {
    operatorId: "6903",
    vehicleShortName: "ELY 18",
    equipment: [
      {
        type: "LOCATION_PRODUCER",
        id: "90156",
      },
    ],
  };

  const feedPublisherId: FeedPublisherId = "fi:kuopio";
  const uniqueVehicleId = getUniqueVehicleIdFromVehicleApcMapping(
    vehicleApcMapping,
    feedPublisherId
  );
  expect(uniqueVehicleId).toBe("fi:kuopio:6903_ELY 18");
});

test("Extracting feed details", () => {
  const feedMap: FeedPublisherMap = new Map([
    ["fi:kuopio", "kuopio"],
    ["fi:jyväskylä", "jyväskylä"],
  ]);
  const topic: PulsarTopic = "fi:kuopio";
  const feedDetails = getFeedDetails(feedMap, topic);
  expect(feedDetails).toEqual({
    feedPublisherId: "kuopio",
  });
});

test("Getting the unique vehicle ID from a valid FeedEntity succeeds", () => {
  const entity: transit_realtime.IFeedEntity = {
    id: "44517_160",
    vehicle: {
      trip: {
        tripId: "Talvikausi_Koulp_4_0_180300_183700_1",
        startTime: "18:03:00",
        startDate: "20221102",
        scheduleRelationship:
          transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED,
        routeId: "4",
        directionId: 0,
      },
      position: {
        latitude: 62.8871765,
        longitude: 27.6281261,
        bearing: 270,
        speed: 8.72222233,
      },
      currentStopSequence: 23,
      currentStatus:
        transit_realtime.VehiclePosition.VehicleStopStatus.IN_TRANSIT_TO,
      timestamp: 1667406730,
      congestionLevel:
        transit_realtime.VehiclePosition.CongestionLevel
          .UNKNOWN_CONGESTION_LEVEL,
      stopId: "201548",
      vehicle: {
        id: "44517_160",
        // Real example. Not in UTF-8.
        label: "NeulamÃ¤ki",
        licensePlate: "JLJ-160",
      },
    },
  };
  const feedPublisherId: FeedPublisherId = "fi:kuopio";
  const uniqueVehicleId: UniqueVehicleId = "fi:kuopio:44517_160";
  expect(getUniqueVehicleId(entity, feedPublisherId)).toBe(uniqueVehicleId);
});

const mockPulsarMessage = ({
  topic,
  properties,
  buffer,
  eventTimestamp,
}: {
  topic: string;
  properties: { [key: string]: string };
  buffer: Buffer;
  eventTimestamp: number;
}): Pulsar.Message => {
  const message = Object.defineProperties(new Pulsar.Message(), {
    getProperties: {
      value: () => properties,
      writable: true,
    },
    getData: {
      value: () => buffer,
      writable: true,
    },
    getEventTimestamp: {
      value: () => eventTimestamp,
      writable: true,
    },
    getTopicName: {
      value: () => topic,
      writable: true,
    },
  });
  return message;
};

const mockGtfsrtMessage = ({
  topic,
  content,
  eventTimestamp,
}: {
  topic: string;
  content: transit_realtime.IFeedMessage;
  eventTimestamp: number;
}): Pulsar.Message => {
  const verificationErrorMessage = transit_realtime.FeedMessage.verify(content);
  if (verificationErrorMessage) {
    throw Error(verificationErrorMessage);
  }
  const buffer = Buffer.from(
    transit_realtime.FeedMessage.encode(
      transit_realtime.FeedMessage.create(content)
    ).finish()
  );
  transit_realtime.FeedMessage.decode(buffer);
  return mockPulsarMessage({ topic, properties: {}, buffer, eventTimestamp });
};

const createMockGtfsrtMessageNotServicing = ({
  topic,
  content,
  eventTimestamp,
}: {
  topic: string;
  content: transit_realtime.IFeedMessage;
  eventTimestamp: number;
}): Pulsar.Message => {
  const verificationErrorMessage = transit_realtime.FeedMessage.verify(content);
  if (verificationErrorMessage) {
    throw Error(verificationErrorMessage);
  }
  const buffer = Buffer.from(
    transit_realtime.FeedMessage.encode(
      transit_realtime.FeedMessage.create(content)
    ).finish()
  );
  transit_realtime.FeedMessage.decode(buffer);
  return mockPulsarMessage({
    topic,
    properties: { isServicing: "false" },
    buffer,
    eventTimestamp,
  });
};

const gtfsrtMessageBeforeStop = mockGtfsrtMessage({
  topic: "persistent://tenant/namespace/gtfs-realtime-vp-fi-kuopio",
  content: {
    header: {
      gtfsRealtimeVersion: "2.0",
      incrementality: transit_realtime.FeedHeader.Incrementality.FULL_DATASET,
      timestamp: 1667406732,
    },
    entity: [
      {
        id: "44517_160",
        vehicle: {
          trip: {
            tripId: "Talvikausi_Koulp_4_0_180300_183700_1",
            startTime: "18:03:00",
            startDate: "20221102",
            scheduleRelationship:
              transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED,
            routeId: "4",
            directionId: 0,
          },
          position: {
            latitude: 62.8871765,
            longitude: 27.6281261,
            bearing: 270,
            speed: 8.72222233,
          },
          // Scheduled to happen at 18:32.
          currentStopSequence: 23,
          currentStatus:
            transit_realtime.VehiclePosition.VehicleStopStatus.IN_TRANSIT_TO,
          timestamp: 1667406732,
          congestionLevel:
            transit_realtime.VehiclePosition.CongestionLevel
              .UNKNOWN_CONGESTION_LEVEL,
          stopId: "201548",
          vehicle: {
            id: "44517_160",
            // Real example. Encoding is not UTF-8.
            label: "NeulamÃ¤ki",
            licensePlate: "JLJ-160",
          },
        },
      },
    ],
  },
  eventTimestamp: 1667413937123,
});

const gtfsrtMessageAfterStop = mockGtfsrtMessage({
  topic: "persistent://tenant/namespace/gtfs-realtime-vp-fi-kuopio",
  content: {
    header: {
      gtfsRealtimeVersion: "2.0",
      incrementality: transit_realtime.FeedHeader.Incrementality.FULL_DATASET,
      timestamp: 1667406777,
    },
    entity: [
      {
        id: "44517_160",
        vehicle: {
          trip: {
            tripId: "Talvikausi_Koulp_4_0_180300_183700_1",
            startTime: "18:03:00",
            startDate: "20221102",
            scheduleRelationship:
              transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED,
            routeId: "4",
            directionId: 0,
          },
          position: {
            latitude: 62.8861765,
            longitude: 27.6283261,
            bearing: 271,
            speed: 8.62222233,
          },
          currentStopSequence: 24,
          currentStatus:
            transit_realtime.VehiclePosition.VehicleStopStatus.IN_TRANSIT_TO,
          timestamp: 1667406770,
          congestionLevel:
            transit_realtime.VehiclePosition.CongestionLevel
              .UNKNOWN_CONGESTION_LEVEL,
          // Fake stopId
          stopId: "123456",
          vehicle: {
            id: "44517_160",
            // Real example. Encoding is not UTF-8.
            label: "NeulamÃ¤ki",
            licensePlate: "JLJ-160",
          },
        },
      },
    ],
  },
  eventTimestamp: 1667413939023,
});

const mockGtfsrtMessageNotServicing = createMockGtfsrtMessageNotServicing({
  topic: "persistent://tenant/namespace/gtfs-realtime-vp-fi-kuopio",
  content: {
    header: {
      gtfsRealtimeVersion: "2.0",
      incrementality: transit_realtime.FeedHeader.Incrementality.FULL_DATASET,
      timestamp: 1667406777,
    },
    entity: [
      {
        id: "44517_160",
        vehicle: {
          trip: {
            tripId: "Talvikausi_Koulp_4_0_180300_183700_1",
            startTime: "18:03:00",
            startDate: "20221102",
            scheduleRelationship:
              transit_realtime.TripDescriptor.ScheduleRelationship.SCHEDULED,
            routeId: "4",
            directionId: 0,
          },
          position: {
            latitude: 62.8861765,
            longitude: 27.6283261,
            bearing: 271,
            speed: 8.62222233,
          },
          currentStopSequence: 24,
          currentStatus:
            transit_realtime.VehiclePosition.VehicleStopStatus.IN_TRANSIT_TO,
          timestamp: 1667406770,
          congestionLevel:
            transit_realtime.VehiclePosition.CongestionLevel
              .UNKNOWN_CONGESTION_LEVEL,
          // Fake stopId
          stopId: "123456",
          vehicle: {
            id: "44517_160",
            // Real example. Encoding is not UTF-8.
            label: "NeulamÃ¤ki",
            licensePlate: "JLJ-160",
          },
        },
      },
    ],
  },
  eventTimestamp: 1667413939023,
});

const addMessage1toCache = (cache: VehicleStateCache) => {
  const feedMap: FeedPublisherMap = new Map([
    ["persistent://tenant/namespace/gtfs-realtime-vp-fi-kuopio", "fi:kuopio"],
    [
      "persistent://tenant/namespace/gtfs-realtime-vp-fi-jyväskylä",
      "fi:jyväskylä",
    ],
  ]);
  const feedMessage1 = transit_realtime.FeedMessage.decode(
    gtfsrtMessageBeforeStop.getData()
  );

  if (feedMessage1.entity[0] == null) {
    throw Error("No entities in the feed message");
  }
  const pulsarTopic1 = gtfsrtMessageBeforeStop.getTopicName();
  const timestamp1 =
    feedMessage1.entity[0]?.vehicle?.timestamp ||
    feedMessage1?.header?.timestamp;

  const feedDetails1 = getFeedDetails(feedMap, pulsarTopic1);
  if (feedDetails1 == null) {
    throw Error("No entities in the feed message");
  }

  const uniqueVehicleId1 = getUniqueVehicleId(
    feedMessage1?.entity[0],
    feedDetails1?.feedPublisherId
  );
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  if (uniqueVehicleId1 != null && timestamp1 != null) {
    addMessageToCache(
      logger,
      cache,
      gtfsrtMessageBeforeStop,
      uniqueVehicleId1,
      timestamp1
    );
  } else {
    throw Error(
      "Could not get uniqueVehicleId or timestamp from the cacheMessage"
    );
  }
  return uniqueVehicleId1;
};

const addMessage2toCache = (cache: VehicleStateCache) => {
  const feedMap: FeedPublisherMap = new Map([
    ["persistent://tenant/namespace/gtfs-realtime-vp-fi-kuopio", "fi:kuopio"],
    [
      "persistent://tenant/namespace/gtfs-realtime-vp-fi-jyväskylä",
      "fi:jyväskylä",
    ],
  ]);
  const feedMessage2 = transit_realtime.FeedMessage.decode(
    gtfsrtMessageAfterStop.getData()
  );

  if (feedMessage2.entity[0] == null) {
    throw Error("No entities in the feed message");
  }

  const pulsarTopic2 = gtfsrtMessageAfterStop.getTopicName();
  const timestamp2 =
    feedMessage2.entity[0]?.vehicle?.timestamp ||
    feedMessage2.header?.timestamp;
  const feedDetails2 = getFeedDetails(feedMap, pulsarTopic2);
  if (feedDetails2 == null) {
    throw Error("No entities in the feed message");
  }

  const uniqueVehicleId2 = getUniqueVehicleId(
    feedMessage2?.entity[0],
    feedDetails2?.feedPublisherId
  );
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  if (uniqueVehicleId2 != null && timestamp2 != null) {
    addMessageToCache(
      logger,
      cache,
      gtfsrtMessageAfterStop,
      uniqueVehicleId2,
      timestamp2
    );
  } else {
    throw Error(
      "Could not get uniqueVehicleId or timestamp from the cacheMessage"
    );
  }
  return uniqueVehicleId2;
};

const addNotServicingMessageToCache = (cache: VehicleStateCache) => {
  const feedMap: FeedPublisherMap = new Map([
    ["persistent://tenant/namespace/gtfs-realtime-vp-fi-kuopio", "fi:kuopio"],
    [
      "persistent://tenant/namespace/gtfs-realtime-vp-fi-jyväskylä",
      "fi:jyväskylä",
    ],
  ]);
  const feedMessage1 = transit_realtime.FeedMessage.decode(
    mockGtfsrtMessageNotServicing.getData()
  );

  if (feedMessage1.entity[0] == null) {
    throw Error("No entities in the feed message");
  }
  const pulsarTopic1 = mockGtfsrtMessageNotServicing.getTopicName();
  const timestamp1 =
    feedMessage1.entity[0]?.vehicle?.timestamp ||
    feedMessage1?.header?.timestamp;

  const feedDetails1 = getFeedDetails(feedMap, pulsarTopic1);
  if (feedDetails1 == null) {
    throw Error("No entities in the feed message");
  }

  const uniqueVehicleId1 = getUniqueVehicleId(
    feedMessage1?.entity[0],
    feedDetails1?.feedPublisherId
  );
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  if (uniqueVehicleId1 != null && timestamp1 != null) {
    addMessageToCache(
      logger,
      cache,
      mockGtfsrtMessageNotServicing,
      uniqueVehicleId1,
      timestamp1
    );
  } else {
    throw Error(
      "Could not get uniqueVehicleId or timestamp from the cacheMessage"
    );
  }
  return uniqueVehicleId1;
};

test("Adding a message to the cache", () => {
  const cache: VehicleStateCache = new Map();
  const uniqueVehicleId1 = addMessage1toCache(cache);
  expect(cache.get(uniqueVehicleId1)).toEqual([1667406732, true]);
});

test("Cache should use newer timestamps", () => {
  const cache: VehicleStateCache = new Map();
  addMessage1toCache(cache);
  const uniqueVehicleId2 = addMessage2toCache(cache);
  expect(cache.get(uniqueVehicleId2)).toEqual([1667406770, true]);
});

test("Not servicing property should work", () => {
  const cache: VehicleStateCache = new Map();
  const uniqueVehicleId2 = addNotServicingMessageToCache(cache);
  expect(cache.get(uniqueVehicleId2)).toEqual([1667406770, false]);
});

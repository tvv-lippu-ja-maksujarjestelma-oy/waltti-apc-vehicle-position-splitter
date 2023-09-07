import pino from "pino";
import { transit_realtime } from "./protobuf/gtfsRealtime";
import { splitVehicles, sendNotServicingMessages } from "./splitter";
import type {
  FeedPublisherId,
  AcceptedVehicles,
  UniqueVehicleId,
  VehicleStateCache,
  LatestSentTimestamp,
  IsServicing,
} from "./config";

test("Testing splitvehicles with one vehicle in message", () => {
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  const feedPublisherId: FeedPublisherId = "fi:kuopio";
  const AcceptedVehicles: AcceptedVehicles = new Set<UniqueVehicleId>();
  const VehicleStateCache: VehicleStateCache = new Map<
    UniqueVehicleId,
    [LatestSentTimestamp, IsServicing]
  >();

  const mainHeader: transit_realtime.IFeedHeader = {
    gtfsRealtimeVersion: "2.0",
    incrementality: 0,
    timestamp: 0,
  };
  const originMessageId = "123";
  const sendCallback = () => {};
  const vehiclesInMessage: AcceptedVehicles = new Set<UniqueVehicleId>();
  AcceptedVehicles.add("fi:kuopio:44517_160");
  const gtfsrtMessage: transit_realtime.FeedMessage =
    transit_realtime.FeedMessage.create({
      header: mainHeader,
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
        },
      ],
    });

  splitVehicles(
    logger,
    gtfsrtMessage,
    feedPublisherId,
    AcceptedVehicles,
    VehicleStateCache,
    mainHeader,
    originMessageId,
    sendCallback,
    vehiclesInMessage
  );
  expect(vehiclesInMessage.size).toBe(1);
  expect(vehiclesInMessage.has("fi:kuopio:44517_160")).toBe(true);
  expect(VehicleStateCache.get("fi:kuopio:44517_160")).toEqual([
    1667406730,
    true,
  ]);
});

test("Testing splitvehicles with multiple vehicles in message", () => {
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  const feedPublisherId: FeedPublisherId = "fi:kuopio";
  const AcceptedVehicles: AcceptedVehicles = new Set<UniqueVehicleId>();
  const VehicleStateCache: VehicleStateCache = new Map<
    UniqueVehicleId,
    [LatestSentTimestamp, IsServicing]
  >();

  const mainHeader: transit_realtime.IFeedHeader = {
    gtfsRealtimeVersion: "2.0",
    incrementality: 0,
    timestamp: 0,
  };
  const originMessageId = "123";
  const sendCallback = () => {};
  const vehiclesInMessage: AcceptedVehicles = new Set<UniqueVehicleId>();
  AcceptedVehicles.add("fi:kuopio:44517_160");
  AcceptedVehicles.add("fi:kuopio:44517_161");
  const gtfsrtMessage: transit_realtime.FeedMessage =
    transit_realtime.FeedMessage.create({
      header: mainHeader,
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
        },
        {
          id: "44517_161",
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
              id: "44517_161",
              // Real example. Not in UTF-8.
              label: "NeulamÃ¤ki",
              licensePlate: "JLJ-160",
            },
          },
        },
        {
          id: "44517_162",
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
              id: "44517_162",
              // Real example. Not in UTF-8.
              label: "NeulamÃ¤ki",
              licensePlate: "JLJ-160",
            },
          },
        },
      ],
    });

  splitVehicles(
    logger,
    gtfsrtMessage,
    feedPublisherId,
    AcceptedVehicles,
    VehicleStateCache,
    mainHeader,
    originMessageId,
    sendCallback,
    vehiclesInMessage
  );
  expect(VehicleStateCache.size).toBe(2);
  expect(vehiclesInMessage.size).toBe(2);
  expect(vehiclesInMessage.has("fi:kuopio:44517_160")).toBe(true);
  expect(vehiclesInMessage.has("fi:kuopio:44517_161")).toBe(true);
  expect(vehiclesInMessage.has("fi:kuopio:44517_162")).toBe(false);
  expect(VehicleStateCache.get("fi:kuopio:44517_160")).toEqual([
    1667406730,
    true,
  ]);
});

test("SendNotServicingMessages Should send callback when isServicing is true and vehicle is not in the message", () => {
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  const VehicleStateCache: VehicleStateCache = new Map<
    UniqueVehicleId,
    [LatestSentTimestamp, IsServicing]
  >();

  const mainHeader: transit_realtime.IFeedHeader = {
    gtfsRealtimeVersion: "2.0",
    incrementality: 0,
    timestamp: 0,
  };
  const originMessageId = "123";
  const sendCallback = jest.fn();
  const vehiclesInMessage: AcceptedVehicles = new Set<UniqueVehicleId>();
  VehicleStateCache.set("fi:kuopio:44517_160", [1667406730, true]);
  sendNotServicingMessages(
    logger,
    VehicleStateCache,
    vehiclesInMessage,
    mainHeader,
    originMessageId,
    sendCallback
  );
  expect(sendCallback).toHaveBeenCalledTimes(1);
});

test("SendNotServicingMessages Should not send callback when isServicing is true and vehicle is in the message", () => {
  const logger = pino(
    {
      name: "waltti-apc-journey-matcher",
      timestamp: pino.stdTimeFunctions.isoTime,
      // As logger is started before config is created, read the level from env.
      level: process.env["PINO_LOG_LEVEL"] ?? "info",
    },
    pino.destination({ sync: true })
  );
  const VehicleStateCache: VehicleStateCache = new Map<
    UniqueVehicleId,
    [LatestSentTimestamp, IsServicing]
  >();

  const mainHeader: transit_realtime.IFeedHeader = {
    gtfsRealtimeVersion: "2.0",
    incrementality: 0,
    timestamp: 0,
  };
  const originMessageId = "123";
  const sendCallback = jest.fn();
  const vehiclesInMessage: AcceptedVehicles = new Set<UniqueVehicleId>();
  vehiclesInMessage.add("fi:kuopio:44517_160");
  VehicleStateCache.set("fi:kuopio:44517_160", [1667406730, true]);
  sendNotServicingMessages(
    logger,
    VehicleStateCache,
    vehiclesInMessage,
    mainHeader,
    originMessageId,
    sendCallback
  );
  expect(sendCallback).toHaveBeenCalledTimes(0);
});

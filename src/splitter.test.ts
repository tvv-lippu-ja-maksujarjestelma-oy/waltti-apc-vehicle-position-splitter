import pino from "pino";
import Pulsar from "pulsar-client";
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
  const sendCallback = jest.fn();
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

  const pulsarMessage = mockPulsarMessage({
    topic: "fi:kuopio:vehiclepositions",
    properties: {},
    buffer: Buffer.from(""),
    eventTimestamp: 0,
  });
  const promises: Promise<Pulsar.MessageId>[] = [];
  splitVehicles(
    logger,
    gtfsrtMessage,
    feedPublisherId,
    AcceptedVehicles,
    VehicleStateCache,
    mainHeader,
    originMessageId,
    sendCallback,
    vehiclesInMessage,
    pulsarMessage,
    promises
  );
  expect(promises.length).toBe(1);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
  expect(Promise.allSettled(promises)).resolves.toEqual([
    { status: "fulfilled", value: undefined },
  ]);
  expect(sendCallback).toHaveBeenCalledTimes(1);
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
  const sendCallback = jest.fn();
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

  const pulsarMessage = mockPulsarMessage({
    topic: "fi:kuopio:vehiclepositions",
    properties: {},
    buffer: Buffer.from(""),
    eventTimestamp: 0,
  });
  const promises: Promise<Pulsar.MessageId>[] = [];

  splitVehicles(
    logger,
    gtfsrtMessage,
    feedPublisherId,
    AcceptedVehicles,
    VehicleStateCache,
    mainHeader,
    originMessageId,
    sendCallback,
    vehiclesInMessage,
    pulsarMessage,
    promises
  );

  expect(promises.length).toBe(2);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
  expect(Promise.allSettled(promises)).resolves.toEqual([
    { status: "fulfilled", value: undefined },
    { status: "fulfilled", value: undefined },
  ]);
  expect(sendCallback).toHaveBeenCalledTimes(2);
  expect(VehicleStateCache.size).toBe(2);
  expect(vehiclesInMessage.size).toBe(2);
  expect(vehiclesInMessage.has("fi:kuopio:44517_160")).toBe(true);
  expect(vehiclesInMessage.has("fi:kuopio:44517_161")).toBe(true);
  expect(vehiclesInMessage.has("fi:kuopio:44517_162")).toBe(false);
  expect(VehicleStateCache.get("fi:kuopio:44517_160")).toEqual([
    1667406730,
    true,
  ]);
  expect(VehicleStateCache.get("fi:kuopio:44517_161")).toEqual([
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
  const promises: Promise<Pulsar.MessageId>[] = [];
  sendNotServicingMessages(
    logger,
    VehicleStateCache,
    vehiclesInMessage,
    mainHeader,
    originMessageId,
    sendCallback,
    promises
  );
  expect(promises.length).toBe(1);
  // eslint-disable-next-line @typescript-eslint/no-floating-promises, jest/valid-expect
  expect(Promise.allSettled(promises)).resolves.toEqual([
    { status: "fulfilled", value: undefined },
  ]);
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
  const promises: Promise<Pulsar.MessageId>[] = [];
  sendNotServicingMessages(
    logger,
    VehicleStateCache,
    vehiclesInMessage,
    mainHeader,
    originMessageId,
    sendCallback,
    promises
  );
  expect(sendCallback).toHaveBeenCalledTimes(0);
});

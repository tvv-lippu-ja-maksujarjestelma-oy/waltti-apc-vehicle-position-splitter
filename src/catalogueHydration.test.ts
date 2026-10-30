import type Pulsar from "pulsar-client";
import pino from "pino";
import { buildAcceptedVehicles, updateAcceptedVehicles } from "./cacheBuilding";

const logger = pino({ level: "silent" });
const feedMap = new Map([["registry", "fi:kuopio"]]);
const snapshot = (data: unknown, ageMs = 6 * 3600 * 1000): Pulsar.Message =>
  ({
    getData: () => Buffer.from(JSON.stringify(data)),
    getTopicName: () => "registry",
    getMessageId: () => ({ toString: () => "catalogue" }),
    getEventTimestamp: () => Date.now() - ageMs,
    getPublishTimestamp: () => Date.now() - ageMs,
    getProperties: () => ({}),
  } as Pulsar.Message);
const catalogue = (name: string) => [
  {
    operatorId: "6852",
    vehicleShortName: name,
    equipment: [{ id: "device", type: "PASSENGER_COUNTER" }],
  },
];

afterEach(() => jest.useRealTimers());

test("hydrates the latest valid retained snapshot even six hours old", async () => {
  jest.useFakeTimers();
  const messages = [
    snapshot(catalogue("old")),
    snapshot(catalogue("1160")),
    snapshot({ invalid: true }),
  ];
  const reader = {
    hasNext: jest.fn(() => Promise.resolve(messages.length > 0)),
    readNext: jest.fn(() => Promise.resolve(messages.shift())),
    seekTimestamp: jest.fn(),
  };
  const accepted = new Set<`${string}:${string}`>();
  const hydration = buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  );
  await jest.runAllTimersAsync();
  await hydration;
  expect([...accepted]).toEqual(["fi:kuopio:6852_1160"]);
  expect(reader.seekTimestamp).not.toHaveBeenCalled();
  expect(reader.readNext).toHaveBeenCalledTimes(3);
});

test("waits through asynchronous absence and invalid data until a valid empty snapshot", async () => {
  jest.useFakeTimers();
  const messages: Pulsar.Message[] = [];
  const reader = {
    hasNext: jest.fn(() => Promise.resolve(messages.length > 0)),
    readNext: jest.fn(() => Promise.resolve(messages.shift())),
  };
  const accepted = new Set<`${string}:${string}`>();
  let ready = false;
  const hydration = buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  ).then(() => {
    ready = true;
  });
  await jest.advanceTimersByTimeAsync(5000);
  expect(ready).toBe(false);
  expect(reader.readNext).not.toHaveBeenCalled();
  messages.push(snapshot({ invalid: true }));
  await jest.advanceTimersByTimeAsync(2000);
  expect(ready).toBe(false);
  messages.push(snapshot([]));
  await jest.runAllTimersAsync();
  await hydration;
  expect(ready).toBe(true);
  expect(accepted.size).toBe(0);
});

test("a malformed update preserves the last valid catalogue", () => {
  const accepted = new Set<`${string}:${string}`>(["fi:kuopio:6852_1160"]);
  expect(updateAcceptedVehicles(logger, snapshot({}), feedMap, accepted)).toBe(
    false
  );
  expect([...accepted]).toEqual(["fi:kuopio:6852_1160"]);
  expect(updateAcceptedVehicles(logger, snapshot([]), feedMap, accepted)).toBe(
    true
  );
  expect(accepted.size).toBe(0);
});

test("stops draining a continuous stream at a current valid snapshot", async () => {
  const reader = {
    hasNext: jest.fn(() => Promise.resolve(true)),
    readNext: jest.fn(() =>
      Promise.resolve(snapshot(catalogue("1160"), -1000))
    ),
  };
  const accepted = new Set<`${string}:${string}`>();
  await buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  );
  expect(reader.readNext).toHaveBeenCalledTimes(1);
  expect([...accepted]).toEqual(["fi:kuopio:6852_1160"]);
});

test("a current malformed snapshot cannot stop draining behind an old empty catalogue", async () => {
  jest.useFakeTimers();
  const messages = [
    snapshot([]),
    snapshot({ invalid: true }, -1000),
    snapshot(catalogue("1160"), -2000),
  ];
  const reader = {
    hasNext: () => Promise.resolve(messages.length > 0),
    readNext: () => Promise.resolve(messages.shift()),
  };
  const accepted = new Set<`${string}:${string}`>();
  const hydration = buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  );
  await jest.runAllTimersAsync();
  await hydration;
  expect([...accepted]).toEqual(["fi:kuopio:6852_1160"]);
  expect(messages).toHaveLength(0);
});

test.each(
  [
    [{ operatorId: "6852", vehicleShortName: "1160", equipment: [] }],
    [
      {
        operatorId: "",
        vehicleShortName: "1160",
        equipment: [{ id: "device", type: "PASSENGER_COUNTER" }],
      },
    ],
  ].map((invalid) => ({ invalid }))
)(
  "eligibility constraints reject the snapshot before replacing the valid set: %j",
  ({ invalid }) => {
    const accepted = new Set<`${string}:${string}`>(["fi:kuopio:6852_1160"]);
    expect(
      updateAcceptedVehicles(logger, snapshot(invalid), feedMap, accepted)
    ).toBe(false);
    expect([...accepted]).toEqual(["fi:kuopio:6852_1160"]);
  }
);

test("a long invalid backlog drains without one-second sleeps per message", async () => {
  jest.useFakeTimers();
  const messages = [
    ...Array.from({ length: 100 }, () => snapshot({ invalid: true })),
    snapshot(catalogue("1160")),
  ];
  const reader = {
    hasNext: () => Promise.resolve(messages.length > 0),
    readNext: () => Promise.resolve(messages.shift()),
  };
  const accepted = new Set<`${string}:${string}`>();
  let ready = false;
  const hydration = buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  ).then(() => {
    ready = true;
  });
  await jest.advanceTimersByTimeAsync(200);
  expect(ready).toBe(true);
  await hydration;
});

test("a valid catalogue with no passenger counters initializes an empty eligible list", async () => {
  jest.useFakeTimers();
  const messages = [
    snapshot([
      {
        operatorId: "6852",
        vehicleShortName: "1160",
        equipment: [{ id: "gps", type: "LOCATION_PRODUCER" }],
      },
    ]),
  ];
  const reader = {
    hasNext: () => messages.length > 0,
    readNext: () => Promise.resolve(messages.shift()),
  };
  const accepted = new Set<`${string}:${string}`>();
  const hydration = buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  );
  await jest.runAllTimersAsync();
  await hydration;
  expect(accepted.size).toBe(0);
  expect(messages).toHaveLength(0);
});

test("duplicate rows and unused metadata quirks preserve catalogue eligibility", () => {
  const vehicle = {
    operatorId: "6852",
    vehicleShortName: "1160",
    vehicleRegistrationNumber: "",
    seatingCapacity: -1,
    standingCapacity: 1.5,
    equipment: [
      { type: "PASSENGER_COUNTER", id: "device" },
      { type: "PASSENGER_COUNTER", id: "device" },
    ],
  };
  const accepted = new Set<`${string}:${string}`>();
  expect(
    updateAcceptedVehicles(
      logger,
      snapshot([vehicle, vehicle, ...catalogue("new")]),
      feedMap,
      accepted
    )
  ).toBe(true);
  expect([...accepted]).toEqual(["fi:kuopio:6852_1160", "fi:kuopio:6852_new"]);
});

test("a 5000-vehicle catalogue yields to the event loop during hydration", async () => {
  const messages = [
    snapshot(
      Array.from({ length: 5000 }, (_, index) => catalogue(String(index))[0])
    ),
  ];
  const reader = {
    hasNext: () => messages.length > 0,
    readNext: () => Promise.resolve(messages.shift()),
  };
  const accepted = new Set<`${string}:${string}`>();
  let timerRan = false;
  const timer = new Promise<void>((resolve) => {
    setTimeout(() => {
      timerRan = true;
      resolve();
    }, 0);
  });
  const start = performance.now();
  const hydration = buildAcceptedVehicles(
    logger,
    accepted,
    reader as unknown as Pulsar.Reader,
    600,
    feedMap,
    1000
  );
  await timer;
  expect(performance.now() - start).toBeLessThan(1000);
  expect(timerRan).toBe(true);
  await hydration;
  expect(accepted.size).toBe(5000);
});

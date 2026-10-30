import type Pulsar from "pulsar-client";
import pino from "pino";
import keepProcessingMessages from "./messageProcessing";
import { transit_realtime } from "./protobuf/gtfsRealtime";

const logger = pino({ level: "silent" });
const message = (data: Buffer, topic: string): Pulsar.Message =>
  ({
    getData: () => data,
    getTopicName: () => topic,
    getMessageId: () => ({ toString: () => "fixture-id" }),
    getEventTimestamp: () => Date.now() - 6 * 3600 * 1000,
    getPublishTimestamp: () => Date.now() - 6 * 3600 * 1000,
    getProperties: () => ({}),
  } as Pulsar.Message);
const pending = <T>(): Promise<T> =>
  new Promise(() => {
    /* Inert fixture wait. */
  });

afterEach(() => jest.useRealTimers());

test.each([true, false])(
  "fixture flow gates receive, send and ack until catalogue hydration (eligible=%s)",
  async (eligible) => {
    jest.useFakeTimers();
    const registry: Pulsar.Message[] = [];
    const vrReader = {
      hasNext: jest.fn(() => Promise.resolve(registry.length > 0)),
      readNext: jest.fn(() =>
        registry.length > 0
          ? Promise.resolve(registry.shift())
          : pending<Pulsar.Message>()
      ),
    };
    const position = message(
      Buffer.from(
        transit_realtime.FeedMessage.encode({
          header: {
            gtfsRealtimeVersion: "2.0",
            incrementality: 0,
            timestamp: 1793012500,
          },
          entity: [
            {
              id: "6852_1160",
              vehicle: { timestamp: 1793012500, vehicle: { id: "6852_1160" } },
            },
          ],
        }).finish()
      ),
      "positions"
    );
    const receive = jest
      .fn()
      .mockResolvedValueOnce(position)
      .mockImplementation(() => pending<Pulsar.Message>());
    const acknowledge = jest.fn();
    const send = jest
      .fn<Promise<Pulsar.MessageId>, [Pulsar.ProducerMessage]>()
      .mockResolvedValue({ toString: () => "output-id" } as Pulsar.MessageId);
    const setReady = jest.fn();
    // Long-running loops are left pending on inert fixture promises after the
    // single source position. They create no background timers or connections.
    const processing = keepProcessingMessages(
      logger,
      { send } as unknown as Pulsar.Producer,
      { receive, acknowledge } as unknown as Pulsar.Consumer,
      vrReader as unknown as Pulsar.Reader,
      {} as Pulsar.Reader,
      {
        feedMap: new Map([
          ["registry", "fi:kuopio"],
          ["positions", "fi:kuopio"],
        ]),
      },
      { cacheWindowInSeconds: 0 },
      { pulsarReadTimeoutMs: 1000 },
      setReady
    );
    let loopError: unknown;
    processing.catch((err: unknown) => {
      loopError = err;
    });
    await jest.advanceTimersByTimeAsync(5000);
    expect(setReady.mock.calls).toEqual([[false]]);
    expect(receive).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(acknowledge).not.toHaveBeenCalled();
    registry.push(message(Buffer.from("malformed"), "registry"));
    await jest.advanceTimersByTimeAsync(2000);
    expect(receive).not.toHaveBeenCalled();
    registry.push(
      message(
        Buffer.from(
          JSON.stringify(
            eligible
              ? [
                  {
                    operatorId: "6852",
                    vehicleShortName: "1160",
                    equipment: [{ type: "PASSENGER_COUNTER", id: "device" }],
                  },
                ]
              : []
          )
        ),
        "registry"
      )
    );
    await jest.advanceTimersByTimeAsync(2000);
    expect(setReady.mock.calls).toEqual([[false], [true]]);
    expect(acknowledge).toHaveBeenCalledWith(position);
    expect(send).toHaveBeenCalledTimes(eligible ? 1 : 0);
    expect(
      send.mock.calls.map(
        ([output]) =>
          transit_realtime.FeedMessage.decode(output.data).entity[0]?.vehicle
            ?.vehicle?.id
      )
    ).toEqual(eligible ? ["6852_1160"] : []);
    expect(loopError).toBeUndefined();
  }
);

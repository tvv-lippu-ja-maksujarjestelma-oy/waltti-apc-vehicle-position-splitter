import { EventEmitter } from "node:events";
import childProcess from "node:child_process";
import type { PulsarConfig } from "./config";
import { createRegistryReader } from "./registryReader";

const config = {
  clientConfig: { serviceUrl: "pulsar://fixture", log: () => undefined },
  vehicleRegistryReaderConfig: { topic: "registry", startMessageId: {} },
} as unknown as PulsarConfig;
const mockChild = () => {
  const child = new EventEmitter();
  const send = jest.fn(
    (
      request: { id: number; operation: string },
      callback: (err: Error | null) => void
    ) => {
      callback(null);
      if (request.operation === "ready" || request.operation === "close")
        queueMicrotask(() =>
          child.emit("message", { id: request.id, value: null })
        );
      return true;
    }
  );
  const kill = jest.fn(() => true);
  const fake = Object.assign(child, { send, kill });
  jest
    .spyOn(childProcess, "fork")
    .mockReturnValue(fake as unknown as childProcess.ChildProcess);
  return fake;
};
afterEach(() => jest.restoreAllMocks());

test("serializes registry operations and reconstructs message metadata", async () => {
  const child = mockChild();
  const reader = await createRegistryReader(config);
  expect(child.send.mock.calls[0]?.[0]).toMatchObject({
    operation: "ready",
    config: { clientConfig: { serviceUrl: "pulsar://fixture" } },
  });
  const available = reader.hasNext();
  await expect(reader.hasNext()).rejects.toThrow(
    "Concurrent registry reader requests"
  );
  child.emit("message", { id: 2, value: true });
  expect(await available).toBe(true);
  const read = reader.readNext();
  child.emit("message", {
    id: 3,
    value: {
      data: Buffer.from("[]"),
      topic: "registry",
      id: "message-id",
      eventTimestamp: 12,
      publishTimestamp: 34,
      properties: { key: "value" },
    },
  });
  const message = await read;
  expect(message.getData().toString()).toBe("[]");
  expect(message.getTopicName()).toBe("registry");
  expect(message.getMessageId().toString()).toBe("message-id");
  expect(message.getEventTimestamp()).toBe(12);
  expect(message.getPublishTimestamp()).toBe(34);
  expect(message.getProperties()).toEqual({ key: "value" });
  await reader.close();
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
});

test("a child crash rejects pending operations and future reads", async () => {
  const child = mockChild();
  const reader = await createRegistryReader(config);
  const available = reader.hasNext();
  child.emit("exit", 134);
  await expect(available).rejects.toThrow("exited (134)");
  await expect(reader.readNext()).rejects.toThrow("exited (134)");
  await expect(reader.close()).rejects.toThrow("exited (134)");
});

test("shutdown kills a registry process stuck in a native broker RPC", async () => {
  jest.useFakeTimers({ doNotFake: ["queueMicrotask"] });
  const child = mockChild();
  const reader = await createRegistryReader(config);
  child.send.mockImplementation(() => true);
  child.kill.mockImplementation(() => {
    child.emit("exit", null);
    return true;
  });
  const close = reader.close();
  const result = close.catch((err: unknown) => err);
  await jest.advanceTimersByTimeAsync(5000);
  const error: unknown = await result;
  expect(error instanceof Error ? error.message : String(error)).toContain(
    "exited"
  );
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
  jest.useRealTimers();
});

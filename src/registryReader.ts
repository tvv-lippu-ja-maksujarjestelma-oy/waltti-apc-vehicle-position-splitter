import path from "node:path";
import { fork } from "node:child_process";
import type Pulsar from "pulsar-client";
import type { PulsarConfig } from "./config";

export interface RegistryReader {
  hasNext: () => boolean | Promise<boolean>;
  readNext: () => Promise<Pulsar.Message>;
  close: () => Promise<null>;
}

export interface RegistryMessage {
  data: Uint8Array;
  topic: string;
  id: string;
  eventTimestamp: number;
  publishTimestamp: number;
  properties: Record<string, string>;
}

interface Reply {
  id: number;
  error?: string;
  value?: boolean | RegistryMessage | null;
}

// hasNext is a synchronous native broker RPC in pulsar-client 1.17. Keeping
// the entire registry reader in a child process protects the HTTP event loop during
// broker delays. There is one outstanding read/check and one prefetched message.
export const createRegistryReader = async (
  config: PulsarConfig
): Promise<RegistryReader> => {
  const clientConfig = { ...config.clientConfig };
  delete clientConfig.log;
  const readerConfig = {
    topic: config.vehicleRegistryReaderConfig.topic,
    readerName: config.vehicleRegistryReaderConfig.readerName,
  };
  const child = fork(path.join(__dirname, "registryReaderProcess.js"), [], {
    stdio: ["ignore", "inherit", "inherit", "ipc"],
    serialization: "advanced",
    execArgv: [],
  });
  let nextId = 1;
  let failure: Error | undefined;
  const pending = new Map<
    number,
    { resolve: (value: Reply["value"]) => void; reject: (err: Error) => void }
  >();
  const fail = (err: Error) => {
    failure = err;
    pending.forEach(({ reject }) => reject(err));
    pending.clear();
  };
  child.on("error", fail);
  child.on("exit", (code) =>
    fail(new Error(`Registry reader process exited (${code})`))
  );
  child.on("message", (reply: Reply) => {
    const request = pending.get(reply.id);
    if (request != null) {
      pending.delete(reply.id);
      if (reply.error != null) request.reject(new Error(reply.error));
      else request.resolve(reply.value);
    }
  });
  const request = (
    operation: "ready" | "hasNext" | "readNext" | "close"
  ): Promise<Reply["value"]> =>
    new Promise((resolve, reject) => {
      if (failure != null) {
        reject(failure);
        return;
      }
      if (pending.size > 0 && operation !== "close") {
        reject(
          new Error("Concurrent registry reader requests are not supported")
        );
        return;
      }
      const id = nextId;
      nextId += 1;
      pending.set(id, { resolve, reject });
      child.send(
        {
          id,
          operation,
          ...(operation === "ready"
            ? {
                config: {
                  clientConfig,
                  readerConfig,
                  oauth2Config: config.oauth2Config,
                },
              }
            : {}),
        },
        (err) => {
          if (err != null) fail(err);
        }
      );
    });
  try {
    await request("ready");
  } catch (err) {
    child.kill("SIGKILL");
    throw err;
  }
  return {
    hasNext: async () => (await request("hasNext")) === true,
    readNext: async () => {
      const value = (await request("readNext")) as RegistryMessage;
      return {
        getData: () => Buffer.from(value.data),
        getTopicName: () => value.topic,
        getMessageId: () => ({ toString: () => value.id }),
        getEventTimestamp: () => value.eventTimestamp,
        getPublishTimestamp: () => value.publishTimestamp,
        getProperties: () => value.properties,
      } as Pulsar.Message;
    },
    close: async () => {
      const killTimer = setTimeout(() => child.kill("SIGKILL"), 5000);
      try {
        await request("close");
        return null;
      } finally {
        clearTimeout(killTimer);
        child.kill("SIGKILL");
      }
    },
  };
};

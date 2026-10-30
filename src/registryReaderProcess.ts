import Pulsar from "pulsar-client";
import type { PulsarConfig } from "./config";
import type { RegistryMessage } from "./registryReader";

interface Request {
  id: number;
  operation: "ready" | "hasNext" | "readNext" | "close";
  config?: Pick<PulsarConfig, "clientConfig" | "oauth2Config"> & {
    readerConfig: { topic: string; readerName?: string };
  };
}
let client: Pulsar.Client | undefined;
let reader: Pulsar.Reader | undefined;
// Do not leave an orphan native client if the application exits unexpectedly.
process.on("disconnect", () => process.exit(0));
process.on("message", (request: Request) => {
  const handle = async () => {
    try {
      let value: boolean | RegistryMessage | null = null;
      if (request.operation === "ready") {
        if (request.config == null)
          throw new Error("Missing registry configuration");
        const { config } = request;
        client = new Pulsar.Client({
          ...config.clientConfig,
          ...(config.oauth2Config == null
            ? {}
            : {
                authentication: new Pulsar.AuthenticationOauth2(
                  config.oauth2Config
                ),
              }),
        });
        reader = await client.createReader({
          ...config.readerConfig,
          startMessageId: Pulsar.MessageId.earliest(),
          receiverQueueSize: 1,
        });
      } else {
        if (reader == null || client == null)
          throw new Error("Registry reader is not initialized");
        if (request.operation === "hasNext")
          value = await Promise.resolve(reader.hasNext());
        else if (request.operation === "readNext") {
          const message = await reader.readNext();
          value = {
            data: message.getData(),
            topic: message.getTopicName(),
            id: message.getMessageId().toString(),
            eventTimestamp: message.getEventTimestamp(),
            publishTimestamp: message.getPublishTimestamp(),
            properties: message.getProperties(),
          };
        } else {
          await reader.close();
          await client.close();
        }
      }
      process.send?.({ id: request.id, value });
      if (request.operation === "close") process.disconnect?.();
    } catch (err) {
      process.send?.({
        id: request.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };
  // The handler delivers all failures over IPC.
  handle().catch(() => process.exit(1));
});

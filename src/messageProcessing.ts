import type pino from "pino";
import type Pulsar from "pulsar-client";
import type {
  ProcessingConfig,
  CacheRebuildConfig,
  MessageProcessingConfig,
} from "./config";
import { initializeSplitting } from "./splitter";

const keepReactingToGtfsrt = async (
  logger: pino.Logger,
  producer: Pulsar.Producer,
  gtfsrtConsumer: Pulsar.Consumer,
  pulsarReadTimeoutMs: number,
  splitVehiclesAndSend: (
    gtfsrtMessage: Pulsar.Message,
    sendCallback: (
      splittedVehicleMessage: Pulsar.ProducerMessage
    ) => Promise<Pulsar.MessageId>,
    acknowledgeMessage: () => void
  ) => void
) => {
  // Errors are handled in the calling function.
  /* eslint-disable no-await-in-loop */
  for (;;) {
    let gtfsrtPulsarMessage: Pulsar.Message | undefined;
    try {
      gtfsrtPulsarMessage = await gtfsrtConsumer.receive(pulsarReadTimeoutMs);
    } catch (err) {
      logger.warn(
        { err, readTimeoutMs: pulsarReadTimeoutMs },
        "GTFS-RT consumer receive failed"
      );
    }
    if (gtfsrtPulsarMessage != null) {
      logger.debug(
        {
          topic: gtfsrtPulsarMessage.getTopicName(),
          eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
          messageId: gtfsrtPulsarMessage.getMessageId().toString(),
          properties: { ...gtfsrtPulsarMessage.getProperties() },
        },
        "Received gtfsrtPulsarMessage"
      );
      splitVehiclesAndSend(
        gtfsrtPulsarMessage,
        (splittedVehicle) => {
          logger.debug("Sending splitter VP message");
          // In case of an error, exit via the listener on unhandledRejection.
          return producer.send(splittedVehicle);
        },
        () => {
          logger.debug(
            {
              topic: gtfsrtPulsarMessage.getTopicName(),
              eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
              messageId: gtfsrtPulsarMessage.getMessageId().toString(),
              properties: { ...gtfsrtPulsarMessage.getProperties() },
            },
            "Ack gtfsrtPulsarMessage"
          );
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          gtfsrtConsumer.acknowledge(gtfsrtPulsarMessage);
        }
      );
    }
  }
  // In case of an error, exit via the listener on unhandledRejection.
};

const keepReadingVehicleRegistry = async (
  vrReader: Pulsar.Reader,
  updateVehicleRegistryCache: (apcMessage: Pulsar.Message) => void
): Promise<void> => {
  // Errors are handled on the main level.
  for (;;) {
    const vrMessage = await vrReader.readNext();
    updateVehicleRegistryCache(vrMessage);
  }
  /* eslint-enable no-await-in-loop */
};

const keepProcessingMessages = async (
  logger: pino.Logger,
  producer: Pulsar.Producer,
  gtfsrtConsumer: Pulsar.Consumer,
  vrReader: Pulsar.Reader,
  cacheReader: Pulsar.Reader,
  processingConfig: ProcessingConfig,
  cacheConfig: CacheRebuildConfig,
  messageProcessingConfig: MessageProcessingConfig
): Promise<void> => {
  const { pulsarReadTimeoutMs } = messageProcessingConfig;
  const { updateVehicleRegistryCache, splitVehiclesAndSend } =
    await initializeSplitting(
      logger,
      cacheReader,
      vrReader,
      processingConfig,
      cacheConfig,
      pulsarReadTimeoutMs
    );
  const promises = [
    keepReactingToGtfsrt(
      logger,
      producer,
      gtfsrtConsumer,
      pulsarReadTimeoutMs,
      splitVehiclesAndSend
    ),
    keepReadingVehicleRegistry(vrReader, updateVehicleRegistryCache),
  ];
  // We expect both promises to stay pending.
  await Promise.all(promises);
};

export default keepProcessingMessages;

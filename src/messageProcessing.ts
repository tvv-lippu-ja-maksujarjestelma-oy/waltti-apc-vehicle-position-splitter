import type pino from "pino";
import type Pulsar from "pulsar-client";
import type { ProcessingConfig, CacheRebuildConfig } from "./config";
import { initializeSplitting } from "./splitter";

const keepReactingToGtfsrt = async (
  logger: pino.Logger,
  producer: Pulsar.Producer,
  gtfsrtConsumer: Pulsar.Consumer,
  splitVehiclesAndSend: (
    gtfsrtMessage: Pulsar.Message,
    sendCallback: (splittedVehicleMessage: Pulsar.ProducerMessage) => void,
    acknowledgeMessage: () => void
  ) => void
) => {
  // Errors are handled in the calling function.
  /* eslint-disable no-await-in-loop */
  for (;;) {
    const gtfsrtPulsarMessage = await gtfsrtConsumer.receive();
    logger.debug(
      {
        topic: gtfsrtPulsarMessage.getTopicName(),
        eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
        messageId: gtfsrtPulsarMessage.getMessageId().toString(),
        // Logging does not work for properties
        properties: gtfsrtPulsarMessage.getProperties(),
      },
      "Received gtfsrtPulsarMessage"
    );
    splitVehiclesAndSend(
      gtfsrtPulsarMessage,
      (splittedVehicle) => {
        logger.debug("Sending splitter VP message");
        // In case of an error, exit via the listener on unhandledRejection.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        producer.send(splittedVehicle);
      },
      () => {
        logger.debug(
          {
            topic: gtfsrtPulsarMessage.getTopicName(),
            eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
            messageId: gtfsrtPulsarMessage.getMessageId().toString(),
            properties: gtfsrtPulsarMessage.getProperties(),
          },
          "Ack gtfsrtPulsarMessage"
        );
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        gtfsrtConsumer.acknowledge(gtfsrtPulsarMessage);
      }
    );
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
  cacheConfig: CacheRebuildConfig
): Promise<void> => {
  const { updateVehicleRegistryCache, splitVehiclesAndSend } =
    await initializeSplitting(
      logger,
      cacheReader,
      vrReader,
      processingConfig,
      cacheConfig
    );
  const promises = [
    keepReactingToGtfsrt(
      logger,
      producer,
      gtfsrtConsumer,
      splitVehiclesAndSend
    ),
    keepReadingVehicleRegistry(vrReader, updateVehicleRegistryCache),
  ];
  // We expect both promises to stay pending.
  await Promise.any(promises);
};

export default keepProcessingMessages;

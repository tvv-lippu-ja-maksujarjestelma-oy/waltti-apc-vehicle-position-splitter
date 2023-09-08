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
    sendCallback: (fullApcMessage: Pulsar.ProducerMessage) => void
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
        properties: gtfsrtPulsarMessage.getProperties(),
      },
      "Received gtfsrtPulsarMessage"
    );
    splitVehiclesAndSend(gtfsrtPulsarMessage, (matchedApcMessage) => {
      // In case of an error, exit via the listener on unhandledRejection.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      producer.send(matchedApcMessage);
      logger.debug("Splitter VP message sent");
    });
    logger.debug(
      {
        topic: gtfsrtPulsarMessage.getTopicName(),
        eventTimestamp: gtfsrtPulsarMessage.getEventTimestamp(),
        messageId: gtfsrtPulsarMessage.getMessageId().toString(),
        properties: gtfsrtPulsarMessage.getProperties(),
      },
      "Ack gtfsrtPulsarMessage"
    );
    // In case of an error, exit via the listener on unhandledRejection.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    gtfsrtConsumer.acknowledge(gtfsrtPulsarMessage);
  }
  /* eslint-enable no-await-in-loop */
};

const keepReadingVehicleRegistry = async (
  vrReader: Pulsar.Reader,
  updateVehicleRegistry: (apcMessage: Pulsar.Message) => void
): Promise<void> => {
  // Errors are handled on the main level.
  /* eslint-disable no-await-in-loop */
  for (;;) {
    const vrMessage = await vrReader.readNext();
    updateVehicleRegistry(vrMessage);
    // In case of an error, exit via the listener on unhandledRejection.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
  }
  /* eslint-enable no-await-in-loop */
};

const keepProcessingMessages = async (
  logger: pino.Logger,
  producer: Pulsar.Producer,
  gtfsrtConsumer: Pulsar.Consumer,
  vrReader: Pulsar.Reader,
  cacheReader: Pulsar.Reader,
  config: ProcessingConfig,
  cacheConfig: CacheRebuildConfig
): Promise<void> => {
  const { updateVehicleRegistry, splitVehiclesAndSend } =
    await initializeSplitting(
      logger,
      cacheReader,
      vrReader,
      config,
      cacheConfig
    );
  const promises = [
    keepReactingToGtfsrt(
      logger,
      producer,
      gtfsrtConsumer,
      splitVehiclesAndSend
    ),
    keepReadingVehicleRegistry(vrReader, updateVehicleRegistry),
  ];
  // We expect both promises to stay pending.
  await Promise.any(promises);
};

export default keepProcessingMessages;

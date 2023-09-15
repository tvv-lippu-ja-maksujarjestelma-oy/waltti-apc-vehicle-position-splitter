import type pino from "pino";
import Pulsar, { MessageId } from "pulsar-client";

export type FeedPublisherId = string;

export type WalttiAuthorityId = string;

export type VehicleId = string;

export type PulsarTopic = string;

export type UniqueVehicleId = `${FeedPublisherId}:${VehicleId}`;

export type AcceptedVehicles = Set<UniqueVehicleId>;

export type LatestSentTimestamp = number;

export type IsServicing = boolean;

export type VehicleStateCache = Map<
  UniqueVehicleId,
  [LatestSentTimestamp, IsServicing]
>;

export type TimezoneName = string;

export type FeedPublisherMap = Map<PulsarTopic, FeedPublisherId>;

export interface ProcessingConfig {
  feedMap: FeedPublisherMap;
}

export interface PulsarOauth2Config {
  // pulsar-client requires "type" but that seems unnecessary
  type: string;
  issuer_url: string;
  client_id?: string;
  client_secret?: string;
  private_key?: string;
  audience?: string;
  scope?: string;
}

export interface PulsarConfig {
  oauth2Config: PulsarOauth2Config;
  clientConfig: Pulsar.ClientConfig;
  producerConfig: Pulsar.ProducerConfig;
  gtfsrtConsumerConfig: Pulsar.ConsumerConfig;
  vehicleRegistryReaderConfig: Pulsar.ReaderConfig;
  cacheReaderConfig: Pulsar.ReaderConfig;
}

export interface HealthCheckConfig {
  port: number;
}

export interface CacheRebuildConfig {
  cacheWindowInSeconds: number;
}

export interface Config {
  processing: ProcessingConfig;
  pulsar: PulsarConfig;
  healthCheck: HealthCheckConfig;
  cacheRebuildConfig: CacheRebuildConfig;
}

const getRequired = (envVariable: string) => {
  const variable = process.env[envVariable];
  if (variable === undefined) {
    throw new Error(`${envVariable} must be defined`);
  }
  return variable;
};

const getOptional = (envVariable: string) => process.env[envVariable];

const getOptionalBooleanWithDefault = (
  envVariable: string,
  defaultValue: boolean
) => {
  let result = defaultValue;
  const str = getOptional(envVariable);
  if (str !== undefined) {
    if (!["false", "true"].includes(str)) {
      throw new Error(`${envVariable} must be either "false" or "true"`);
    }
    result = str === "true";
  }
  return result;
};

const getStringMap = (envVariable: string): Map<string, string> => {
  // Check the contents below. Crashing here is fine, too.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const keyValueList = JSON.parse(getRequired(envVariable));
  if (!Array.isArray(keyValueList)) {
    throw new Error(`${envVariable} must be a an array`);
  }
  const map = new Map<string, string>(keyValueList);
  if (map.size < 1) {
    throw new Error(
      `${envVariable} must have at least one array entry in the form of [string, string]. Now got ${JSON.stringify(
        map
      )}.`
    );
  }
  if (map.size !== keyValueList.length) {
    throw new Error(`${envVariable} must have each key only once.`);
  }
  if (
    Array.from(map.values()).some(
      (x) => typeof x !== "string" || x.length < 1
    ) ||
    Array.from(map.keys()).some((x) => typeof x !== "string" || x.length < 1)
  ) {
    throw new Error(
      `${envVariable} must contain only strings in the form of [string, string]. Now got ${JSON.stringify(
        map
      )}.`
    );
  }
  return map;
};

const getProcessingConfig = () => {
  const feedMap = getStringMap("FEED_MAP");
  return {
    feedMap,
  };
};

const getPulsarOauth2Config = () => ({
  // pulsar-client requires "type" but that seems unnecessary
  type: "client_credentials",
  issuer_url: getRequired("PULSAR_OAUTH2_ISSUER_URL"),
  private_key: getRequired("PULSAR_OAUTH2_KEY_PATH"),
  audience: getRequired("PULSAR_OAUTH2_AUDIENCE"),
});

const createPulsarLog =
  (logger: pino.Logger) =>
  (
    level: Pulsar.LogLevel,
    file: string,
    line: number,
    message: string
  ): void => {
    switch (level) {
      case Pulsar.LogLevel.DEBUG:
        logger.debug({ file, line }, message);
        break;
      case Pulsar.LogLevel.INFO:
        logger.info({ file, line }, message);
        break;
      case Pulsar.LogLevel.WARN:
        logger.warn({ file, line }, message);
        break;
      case Pulsar.LogLevel.ERROR:
        logger.error({ file, line }, message);
        break;
      default: {
        const exhaustiveCheck: never = level;
        throw new Error(String(exhaustiveCheck));
      }
    }
  };

const getPulsarCompressionType = (): Pulsar.CompressionType => {
  const compressionType = getOptional("PULSAR_COMPRESSION_TYPE") ?? "ZSTD";
  // tsc does not understand:
  // if (!["Zlib", "LZ4", "ZSTD", "SNAPPY"].includes(compressionType)) {
  if (
    compressionType !== "Zlib" &&
    compressionType !== "LZ4" &&
    compressionType !== "ZSTD" &&
    compressionType !== "SNAPPY"
  ) {
    throw new Error(
      "If defined, PULSAR_COMPRESSION_TYPE must be one of 'Zlib', 'LZ4', " +
        "'ZSTD' or 'SNAPPY'. Default is 'ZSTD'."
    );
  }
  return compressionType;
};

const getOptionalFloat = (envVariable: string): number | undefined => {
  const string = getOptional(envVariable);
  return string !== undefined ? parseFloat(string) : undefined;
};

const getOptionalNonNegativeFloat = (
  envVariable: string
): number | undefined => {
  const float = getOptionalFloat(envVariable);
  if (float != null && (!Number.isFinite(float) || float < 0)) {
    throw new Error(
      `${envVariable} must be a non-negative, finite float if given. Instead, ${float} was given.`
    );
  }
  return float;
};

const getCacheRebuildConfig = () => {
  const cacheWindowInSeconds =
    getOptionalNonNegativeFloat("CACHE_WINDOW_IN_SECONDS") ?? 172800;
  return {
    cacheWindowInSeconds,
  };
};

const getPulsarConfig = (logger: pino.Logger): PulsarConfig => {
  const oauth2Config = getPulsarOauth2Config();
  const serviceUrl = getRequired("PULSAR_SERVICE_URL");
  const tlsValidateHostname = getOptionalBooleanWithDefault(
    "PULSAR_TLS_VALIDATE_HOSTNAME",
    true
  );
  const log = createPulsarLog(logger);
  const producerTopic = getRequired("PULSAR_PRODUCER_TOPIC");
  const blockIfQueueFull = getOptionalBooleanWithDefault(
    "PULSAR_BLOCK_IF_QUEUE_FULL",
    true
  );
  const compressionType = getPulsarCompressionType();
  const gtfsrtConsumerTopicsPattern = getRequired(
    "PULSAR_GTFSRT_CONSUMER_TOPICS_PATTERN"
  );
  const cacheReaderName = getRequired("PULSAR_CACHE_READER_NAME");
  const cacheReaderStartMessageId = MessageId.earliest();
  const vehicleReaderTopic = getRequired("PULSAR_VEHICLE_READER_TOPIC");
  const vehicleReaderName = getRequired("PULSAR_VEHICLE_READER_NAME");
  const vehicleReaderStartMessageId = MessageId.earliest();
  const gtfsrtSubscription = getRequired("PULSAR_GTFSRT_SUBSCRIPTION");
  const gtfsrtSubscriptionType = "Exclusive";
  const gtfsrtSubscriptionInitialPosition = "Earliest";

  return {
    oauth2Config,
    clientConfig: {
      serviceUrl,
      tlsValidateHostname,
      log,
    },
    producerConfig: {
      topic: producerTopic,
      blockIfQueueFull,
      compressionType,
    },
    gtfsrtConsumerConfig: {
      topicsPattern: gtfsrtConsumerTopicsPattern,
      subscription: gtfsrtSubscription,
      subscriptionType: gtfsrtSubscriptionType,
      subscriptionInitialPosition: gtfsrtSubscriptionInitialPosition,
    },
    cacheReaderConfig: {
      topic: producerTopic,
      readerName: cacheReaderName,
      startMessageId: cacheReaderStartMessageId,
    },
    vehicleRegistryReaderConfig: {
      topic: vehicleReaderTopic,
      readerName: vehicleReaderName,
      startMessageId: vehicleReaderStartMessageId,
    },
  };
};

const getHealthCheckConfig = () => {
  const port = parseInt(getOptional("HEALTH_CHECK_PORT") ?? "8080", 10);
  return { port };
};

export const getConfig = (logger: pino.Logger): Config => ({
  processing: getProcessingConfig(),
  cacheRebuildConfig: getCacheRebuildConfig(),
  pulsar: getPulsarConfig(logger),
  healthCheck: getHealthCheckConfig(),
});

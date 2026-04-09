import { z } from "zod";

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length === 0 ? undefined : trimmedValue;
}

const optionalString = z.preprocess(emptyStringToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyStringToUndefined, z.string().url().optional());
const booleanFromString = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    return value.trim().toLowerCase();
  },
  z.enum(["true", "false"]).transform((value) => value === "true"),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  VERCEL_URL: optionalString,
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  APP_NAME: z.string().default("market-research-mvp"),
  APP_URL: optionalUrl,
  DATABASE_URL: optionalString,
  DIRECT_URL: optionalString,
  USE_MOCK_PROVIDERS: booleanFromString.default("true"),
  ENABLE_X_CONNECTOR: booleanFromString.default("false"),
  ENABLE_AMAZON_CONNECTOR: booleanFromString.default("false"),
  ENABLE_KEEPA_CONNECTOR: booleanFromString.default("false"),
  ENABLE_SCHEDULED_JOBS: booleanFromString.default("false"),
  X_BEARER_TOKEN: optionalString,
  X_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  X_DEFAULT_QUERY_WINDOW_DAYS: z.coerce.number().int().min(1).max(7).default(7),
  X_DEFAULT_LOCALE: optionalString,
  SOCIAL_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  AMAZON_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  MARKET_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  LIVE_DATA_REVALIDATE_SECONDS: z.coerce.number().int().min(60).default(1800),
  AMAZON_ACCESS_KEY_ID: optionalString,
  AMAZON_SECRET_ACCESS_KEY: optionalString,
  KEEPA_API_KEY: optionalString,
  CRON_SECRET: optionalString,
  REFRESH_CRON: z.string().default("0 */6 * * *"),
  JOB_RETRY_LIMIT: z.coerce.number().int().min(0).max(10).default(3),
  JOB_RETRY_BACKOFF_MS: z.coerce.number().int().min(100).default(2000),
  DEFAULT_PLATFORM_FEE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  DEFAULT_SHIPPING_COST: z.coerce.number().min(0).default(750),
  DEFAULT_OTHER_COST: z.coerce.number().min(0).default(0),
  HIGH_MARGIN_THRESHOLD: z.coerce.number().min(0).default(0.2),
  MOCK_WATCH_KEYWORDS: z
    .string()
    .default("limited release,restock,best seller,price spike"),
  MOCK_WATCH_CATEGORIES: z.string().default("Collectibles,Audio,Gaming,Power"),
});

type EnvironmentSource = Record<string, string | undefined>;

export function parseEnvironment(source: EnvironmentSource) {
  const parsedEnv = envSchema.parse({
    NODE_ENV: source.NODE_ENV,
    VERCEL_ENV: source.VERCEL_ENV,
    VERCEL_URL: source.VERCEL_URL,
    LOG_LEVEL: source.LOG_LEVEL,
    APP_NAME: source.APP_NAME,
    APP_URL: source.APP_URL,
    DATABASE_URL: source.DATABASE_URL,
    DIRECT_URL: source.DIRECT_URL,
    USE_MOCK_PROVIDERS: source.USE_MOCK_PROVIDERS,
    ENABLE_X_CONNECTOR: source.ENABLE_X_CONNECTOR,
    ENABLE_AMAZON_CONNECTOR: source.ENABLE_AMAZON_CONNECTOR,
    ENABLE_KEEPA_CONNECTOR: source.ENABLE_KEEPA_CONNECTOR,
    ENABLE_SCHEDULED_JOBS: source.ENABLE_SCHEDULED_JOBS,
    X_BEARER_TOKEN: source.X_BEARER_TOKEN,
    X_REQUEST_TIMEOUT_MS: source.X_REQUEST_TIMEOUT_MS,
    X_DEFAULT_QUERY_WINDOW_DAYS: source.X_DEFAULT_QUERY_WINDOW_DAYS,
    X_DEFAULT_LOCALE: source.X_DEFAULT_LOCALE,
    SOCIAL_REQUEST_TIMEOUT_MS: source.SOCIAL_REQUEST_TIMEOUT_MS,
    AMAZON_REQUEST_TIMEOUT_MS: source.AMAZON_REQUEST_TIMEOUT_MS,
    MARKET_REQUEST_TIMEOUT_MS: source.MARKET_REQUEST_TIMEOUT_MS,
    LIVE_DATA_REVALIDATE_SECONDS: source.LIVE_DATA_REVALIDATE_SECONDS,
    AMAZON_ACCESS_KEY_ID: source.AMAZON_ACCESS_KEY_ID,
    AMAZON_SECRET_ACCESS_KEY: source.AMAZON_SECRET_ACCESS_KEY,
    KEEPA_API_KEY: source.KEEPA_API_KEY,
    CRON_SECRET: source.CRON_SECRET,
    REFRESH_CRON: source.REFRESH_CRON,
    JOB_RETRY_LIMIT: source.JOB_RETRY_LIMIT,
    JOB_RETRY_BACKOFF_MS: source.JOB_RETRY_BACKOFF_MS,
    DEFAULT_PLATFORM_FEE_RATE: source.DEFAULT_PLATFORM_FEE_RATE,
    DEFAULT_SHIPPING_COST: source.DEFAULT_SHIPPING_COST,
    DEFAULT_OTHER_COST: source.DEFAULT_OTHER_COST,
    HIGH_MARGIN_THRESHOLD: source.HIGH_MARGIN_THRESHOLD,
    MOCK_WATCH_KEYWORDS: source.MOCK_WATCH_KEYWORDS,
    MOCK_WATCH_CATEGORIES: source.MOCK_WATCH_CATEGORIES,
  });

  const resolvedAppUrl =
    parsedEnv.APP_URL ?? (parsedEnv.VERCEL_URL ? `https://${parsedEnv.VERCEL_URL}` : "http://localhost:3000");

  return {
    env: {
      ...parsedEnv,
      APP_URL: resolvedAppUrl,
      DIRECT_URL: parsedEnv.DIRECT_URL ?? parsedEnv.DATABASE_URL,
    },
    envStatus: {
      isVercelDeployment: Boolean(parsedEnv.VERCEL_URL),
      deploymentEnvironment: parsedEnv.VERCEL_ENV ?? parsedEnv.NODE_ENV,
      databaseConfigured: Boolean(parsedEnv.DATABASE_URL),
      directDatabaseConfigured: Boolean(parsedEnv.DIRECT_URL ?? parsedEnv.DATABASE_URL),
      xCredentialsConfigured: Boolean(parsedEnv.X_BEARER_TOKEN),
      amazonCredentialsConfigured: Boolean(parsedEnv.AMAZON_ACCESS_KEY_ID && parsedEnv.AMAZON_SECRET_ACCESS_KEY),
      keepaCredentialsConfigured: Boolean(parsedEnv.KEEPA_API_KEY),
      scheduledJobsEnabled: parsedEnv.ENABLE_SCHEDULED_JOBS,
      cronSecretConfigured: Boolean(parsedEnv.CRON_SECRET),
    },
  };
}

const parsedEnvironment = parseEnvironment(process.env);

export const env = parsedEnvironment.env;
export const envStatus = parsedEnvironment.envStatus;

export function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

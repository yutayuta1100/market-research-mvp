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
  APP_NAME: z.string().default("market-research-mvp"),
  APP_URL: optionalUrl,
  DATABASE_URL: optionalString,
  DIRECT_URL: optionalString,
  USE_MOCK_PROVIDERS: booleanFromString.default("true"),
  ENABLE_X_CONNECTOR: booleanFromString.default("false"),
  ENABLE_AMAZON_CONNECTOR: booleanFromString.default("false"),
  ENABLE_KEEPA_CONNECTOR: booleanFromString.default("false"),
  X_BEARER_TOKEN: z.string().optional(),
  AMAZON_ACCESS_KEY_ID: z.string().optional(),
  AMAZON_SECRET_ACCESS_KEY: z.string().optional(),
  KEEPA_API_KEY: z.string().optional(),
  DEFAULT_PLATFORM_FEE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  DEFAULT_SHIPPING_COST: z.coerce.number().min(0).default(750),
  DEFAULT_OTHER_COST: z.coerce.number().min(0).default(0),
  HIGH_MARGIN_THRESHOLD: z.coerce.number().min(0).default(0.2),
  MOCK_WATCH_KEYWORDS: z
    .string()
    .default("limited release,restock,best seller,price spike"),
  MOCK_WATCH_CATEGORIES: z.string().default("Collectibles,Audio,Gaming,Power"),
});

const parsedEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  APP_NAME: process.env.APP_NAME,
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  USE_MOCK_PROVIDERS: process.env.USE_MOCK_PROVIDERS,
  ENABLE_X_CONNECTOR: process.env.ENABLE_X_CONNECTOR,
  ENABLE_AMAZON_CONNECTOR: process.env.ENABLE_AMAZON_CONNECTOR,
  ENABLE_KEEPA_CONNECTOR: process.env.ENABLE_KEEPA_CONNECTOR,
  X_BEARER_TOKEN: process.env.X_BEARER_TOKEN,
  AMAZON_ACCESS_KEY_ID: process.env.AMAZON_ACCESS_KEY_ID,
  AMAZON_SECRET_ACCESS_KEY: process.env.AMAZON_SECRET_ACCESS_KEY,
  KEEPA_API_KEY: process.env.KEEPA_API_KEY,
  DEFAULT_PLATFORM_FEE_RATE: process.env.DEFAULT_PLATFORM_FEE_RATE,
  DEFAULT_SHIPPING_COST: process.env.DEFAULT_SHIPPING_COST,
  DEFAULT_OTHER_COST: process.env.DEFAULT_OTHER_COST,
  HIGH_MARGIN_THRESHOLD: process.env.HIGH_MARGIN_THRESHOLD,
  MOCK_WATCH_KEYWORDS: process.env.MOCK_WATCH_KEYWORDS,
  MOCK_WATCH_CATEGORIES: process.env.MOCK_WATCH_CATEGORIES,
});

const resolvedAppUrl =
  parsedEnv.APP_URL ?? (parsedEnv.VERCEL_URL ? `https://${parsedEnv.VERCEL_URL}` : "http://localhost:3000");

export const env = {
  ...parsedEnv,
  APP_URL: resolvedAppUrl,
  DIRECT_URL: parsedEnv.DIRECT_URL ?? parsedEnv.DATABASE_URL,
};

export const envStatus = {
  isVercelDeployment: Boolean(parsedEnv.VERCEL_URL),
  deploymentEnvironment: parsedEnv.VERCEL_ENV ?? parsedEnv.NODE_ENV,
  databaseConfigured: Boolean(parsedEnv.DATABASE_URL),
  directDatabaseConfigured: Boolean(parsedEnv.DIRECT_URL ?? parsedEnv.DATABASE_URL),
  xCredentialsConfigured: Boolean(parsedEnv.X_BEARER_TOKEN),
  amazonCredentialsConfigured: Boolean(parsedEnv.AMAZON_ACCESS_KEY_ID && parsedEnv.AMAZON_SECRET_ACCESS_KEY),
  keepaCredentialsConfigured: Boolean(parsedEnv.KEEPA_API_KEY),
};

export function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

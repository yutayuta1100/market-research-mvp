import type { AppLocale } from "@/lib/i18n";
import { env } from "@/lib/config/env";
import { createXLiveConnector } from "@/lib/connectors/live-x";
import { createMockConnector } from "@/lib/connectors/mock";
import { createPublicAmazonConnector } from "@/lib/connectors/public-amazon";
import { createPublicMarketConnector } from "@/lib/connectors/public-market";
import { createPublicSocialConnector } from "@/lib/connectors/public-social";
import type { ConnectorConfig, SignalConnector } from "@/lib/connectors/types";
import { createLogger } from "@/lib/logger";

export const defaultConnectorConfig: ConnectorConfig = {
  useMockProviders: env.USE_MOCK_PROVIDERS,
  xEnabled: env.ENABLE_X_CONNECTOR,
  amazonEnabled: env.ENABLE_AMAZON_CONNECTOR,
  keepaEnabled: env.ENABLE_KEEPA_CONNECTOR,
  xBearerToken: env.X_BEARER_TOKEN,
  amazonAccessKeyId: env.AMAZON_ACCESS_KEY_ID,
  amazonSecretAccessKey: env.AMAZON_SECRET_ACCESS_KEY,
  keepaApiKey: env.KEEPA_API_KEY,
  xRequestTimeoutMs: env.X_REQUEST_TIMEOUT_MS,
  socialRequestTimeoutMs: env.SOCIAL_REQUEST_TIMEOUT_MS,
  amazonRequestTimeoutMs: env.AMAZON_REQUEST_TIMEOUT_MS,
  marketRequestTimeoutMs: env.MARKET_REQUEST_TIMEOUT_MS,
  liveDataRevalidateSeconds: env.LIVE_DATA_REVALIDATE_SECONDS,
  xDefaultQueryWindowDays: env.X_DEFAULT_QUERY_WINDOW_DAYS,
  xDefaultLocale: env.X_DEFAULT_LOCALE,
  logLevel: env.LOG_LEVEL,
};

function getMockReason(
  connectorName: "X" | "Amazon" | "Keepa",
  requested: boolean,
  credentialAvailable: boolean,
  useMockProviders: boolean,
  locale: AppLocale,
) {
  if (useMockProviders) {
    return locale === "ja"
      ? `${connectorName} はモックフィードで稼働中です。安全なローカル・プレビュー運用のため、モックを優先しています。`
      : `Mock feed active for ${connectorName}. Mock mode is taking priority for safe local, preview, and demo use.`;
  }

  if (!requested || !credentialAvailable) {
    return locale === "ja"
      ? `${connectorName} はライブ認証情報が未設定、またはコネクタが無効なためモックにフォールバックしています。`
      : `Mock fallback active for ${connectorName} because live credentials are unavailable or the connector is disabled.`;
  }

  return locale === "ja"
    ? `${connectorName} はモックのプレースホルダーで稼働中です。feature flag と認証情報の設定を再確認してください。`
    : `Mock placeholder active for ${connectorName}. Re-check the feature flag and credentials if you expected a different mode.`;
}

export function buildSignalConnectors(
  config: ConnectorConfig = defaultConnectorConfig,
  locale: AppLocale = "ja",
): SignalConnector[] {
  const logger = createLogger(config.logLevel);

  return [
    config.useMockProviders
      ? createMockConnector(
          "x",
          getMockReason("X", config.xEnabled, Boolean(config.xBearerToken), config.useMockProviders, locale),
          locale,
        )
      : config.xEnabled && Boolean(config.xBearerToken)
        ? createXLiveConnector({
            config,
            locale,
            logger,
          })
        : createPublicSocialConnector({
            locale,
            logger,
            timeoutMs: config.socialRequestTimeoutMs,
            revalidateSeconds: config.liveDataRevalidateSeconds,
          }),
    config.useMockProviders
      ? createMockConnector(
          "amazon",
          getMockReason(
            "Amazon",
            config.amazonEnabled,
            Boolean(config.amazonAccessKeyId && config.amazonSecretAccessKey),
            config.useMockProviders,
            locale,
          ),
          locale,
        )
      : createPublicAmazonConnector({
          locale,
          logger,
          timeoutMs: config.amazonRequestTimeoutMs,
          revalidateSeconds: config.liveDataRevalidateSeconds,
        }),
    config.useMockProviders
      ? createMockConnector(
          "keepa",
          getMockReason("Keepa", config.keepaEnabled, Boolean(config.keepaApiKey), config.useMockProviders, locale),
          locale,
        )
      : createPublicMarketConnector({
          locale,
          logger,
          timeoutMs: config.marketRequestTimeoutMs,
          revalidateSeconds: config.liveDataRevalidateSeconds,
        }),
  ];
}

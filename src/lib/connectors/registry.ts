import type { AppLocale } from "@/lib/i18n";
import { env } from "@/lib/config/env";
import { createXLiveConnector } from "@/lib/connectors/live-x";
import { createMockConnector } from "@/lib/connectors/mock";
import { createStubConnector } from "@/lib/connectors/stub";
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

function getStubReason(connectorName: "Amazon" | "Keepa", requested: boolean, locale: AppLocale) {
  if (!requested) {
    return locale === "ja"
      ? `${connectorName} は現在無効です。Milestone 2 では必要時のみ stub adapter を表示します。`
      : `${connectorName} is currently disabled. Milestone 2 only exposes the stub adapter when the feature flag is enabled.`;
  }

  return locale === "ja"
    ? `${connectorName} は Milestone 2 では stub adapter です。実運用の取り込みは次の実装に回しています。`
    : `${connectorName} is a Milestone 2 stub adapter. Live ingestion is intentionally deferred to a later implementation.`;
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
        : createMockConnector(
            "x",
            getMockReason("X", config.xEnabled, Boolean(config.xBearerToken), config.useMockProviders, locale),
            locale,
          ),
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
      : config.amazonEnabled
        ? createStubConnector("amazon", getStubReason("Amazon", config.amazonEnabled, locale), locale)
        : createMockConnector(
            "amazon",
            getMockReason(
              "Amazon",
              config.amazonEnabled,
              Boolean(config.amazonAccessKeyId && config.amazonSecretAccessKey),
              config.useMockProviders,
              locale,
            ),
            locale,
          ),
    config.useMockProviders
      ? createMockConnector(
          "keepa",
          getMockReason("Keepa", config.keepaEnabled, Boolean(config.keepaApiKey), config.useMockProviders, locale),
          locale,
        )
      : config.keepaEnabled
        ? createStubConnector("keepa", getStubReason("Keepa", config.keepaEnabled, locale), locale)
        : createMockConnector(
            "keepa",
            getMockReason("Keepa", config.keepaEnabled, Boolean(config.keepaApiKey), config.useMockProviders, locale),
            locale,
          ),
  ];
}

import { env } from "@/lib/config/env";
import { createMockConnector } from "@/lib/connectors/mock";
import type { ConnectorConfig, SignalConnector } from "@/lib/connectors/types";

export const defaultConnectorConfig: ConnectorConfig = {
  useMockProviders: env.USE_MOCK_PROVIDERS,
  xEnabled: env.ENABLE_X_CONNECTOR,
  amazonEnabled: env.ENABLE_AMAZON_CONNECTOR,
  keepaEnabled: env.ENABLE_KEEPA_CONNECTOR,
  xBearerToken: env.X_BEARER_TOKEN,
  amazonAccessKeyId: env.AMAZON_ACCESS_KEY_ID,
  amazonSecretAccessKey: env.AMAZON_SECRET_ACCESS_KEY,
  keepaApiKey: env.KEEPA_API_KEY,
};

function getMockReason(
  connectorName: "X" | "Amazon" | "Keepa",
  requested: boolean,
  credentialAvailable: boolean,
  useMockProviders: boolean,
) {
  if (useMockProviders) {
    return `Mock feed active for ${connectorName}. Live adapters are intentionally deferred until Milestone 2.`;
  }

  if (!requested || !credentialAvailable) {
    return `Mock fallback active for ${connectorName} because live credentials are unavailable or the connector is disabled.`;
  }

  return `Mock placeholder active for ${connectorName}; live adapter wiring is intentionally out of scope for Milestone 0 and 1.`;
}

export function buildSignalConnectors(config: ConnectorConfig = defaultConnectorConfig): SignalConnector[] {
  return [
    createMockConnector(
      "x",
      getMockReason("X", config.xEnabled, Boolean(config.xBearerToken), config.useMockProviders),
    ),
    createMockConnector(
      "amazon",
      getMockReason(
        "Amazon",
        config.amazonEnabled,
        Boolean(config.amazonAccessKeyId && config.amazonSecretAccessKey),
        config.useMockProviders,
      ),
    ),
    createMockConnector(
      "keepa",
      getMockReason("Keepa", config.keepaEnabled, Boolean(config.keepaApiKey), config.useMockProviders),
    ),
  ];
}


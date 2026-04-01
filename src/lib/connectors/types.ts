export type ConnectorKind = "x" | "amazon" | "keepa";

export interface ConnectorContext {
  keywords: string[];
  categories: string[];
}

export interface ConnectorSignal {
  id: string;
  connector: ConnectorKind;
  candidateSlug: string;
  keyword: string;
  category: string;
  metricLabel: string;
  metricValue: number;
  strength: number;
  summary: string;
  observedAt: string;
  referenceUrl?: string;
}

export interface ConnectorConfig {
  useMockProviders: boolean;
  xEnabled: boolean;
  amazonEnabled: boolean;
  keepaEnabled: boolean;
  xBearerToken?: string;
  amazonAccessKeyId?: string;
  amazonSecretAccessKey?: string;
  keepaApiKey?: string;
}

export interface SignalConnector {
  kind: ConnectorKind;
  mode: "mock";
  statusMessage: string;
  fetchSignals(context: ConnectorContext): Promise<ConnectorSignal[]>;
}


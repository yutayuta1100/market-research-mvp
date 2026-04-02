export type ConnectorKind = "x" | "amazon" | "keepa";
export type ConnectorMode = "mock" | "live" | "stub";
export type ConnectorState = "ready" | "degraded";

export interface WatchTarget {
  candidateSlug: string;
  displayKeyword: string;
  category: string;
  xQueryTerms: string[];
}

export interface ConnectorContext {
  keywords: string[];
  categories: string[];
  targets: WatchTarget[];
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
  metadata?: Record<string, unknown>;
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
  xRequestTimeoutMs: number;
  xDefaultQueryWindowDays: number;
  xDefaultLocale?: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export interface ConnectorStatus {
  kind: ConnectorKind;
  mode: ConnectorMode;
  state: ConnectorState;
  statusMessage: string;
}

export interface ConnectorFetchResult {
  signals: ConnectorSignal[];
  status: ConnectorStatus;
}

export interface SignalConnector {
  kind: ConnectorKind;
  mode: ConnectorMode;
  fetchSignals(context: ConnectorContext): Promise<ConnectorFetchResult>;
}

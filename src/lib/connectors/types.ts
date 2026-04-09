export type ConnectorKind = "x" | "amazon" | "keepa";
export type ConnectorMode = "mock" | "live" | "stub";
export type ConnectorState = "ready" | "degraded";

export interface SignalEvidence {
  id: string;
  label: string;
  url: string;
  sourceLabel?: string;
  summary?: string;
  observedAt?: string;
}

export interface SignalVerification {
  status: "verified" | "mixed" | "unverified";
  summary: string;
  evidenceCount: number;
}

export interface WatchTarget {
  candidateSlug: string;
  displayKeyword: string;
  category: string;
  xQueryTerms: string[];
  socialQuery: string;
  socialMatchTerms: string[];
  socialRequiredTerms: string[];
  socialExcludedTerms: string[];
  amazonSearchQuery: string;
  amazonMatchTerms: string[];
  amazonRequiredTerms: string[];
  amazonExcludedTerms: string[];
  resaleSearchQuery: string;
  resaleMatchTerms: string[];
  resaleRequiredTerms: string[];
  resaleExcludedTerms: string[];
  fallbackBuyPrice: number;
  fallbackSellPrice: number;
  fallbackThumbnailUrl: string;
  officialUrl: string;
  officialLabel: string;
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
  evidence?: SignalEvidence[];
  verification?: SignalVerification;
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
  socialRequestTimeoutMs: number;
  amazonRequestTimeoutMs: number;
  marketRequestTimeoutMs: number;
  liveDataRevalidateSeconds: number;
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

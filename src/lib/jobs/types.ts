import type { ConnectorKind, ConnectorMode, ConnectorState } from "@/lib/connectors/types";
import type { AppLocale } from "@/lib/i18n";

export type JobTrigger = "manual" | "scheduled" | "api" | "seed";
export type JobRunStatus = "success" | "failed";

export interface JobConnectorSnapshot {
  kind: ConnectorKind;
  mode: ConnectorMode;
  state: ConnectorState;
}

export interface JobRunRecord {
  id: string;
  jobName: string;
  trigger: JobTrigger;
  status: JobRunStatus;
  locale: AppLocale;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  candidateCount: number;
  signalCount: number;
  connectorSummary: JobConnectorSnapshot[];
  notes?: string;
  error?: string;
  createdAt: string;
}

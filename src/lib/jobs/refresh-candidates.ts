import { loadDashboardData } from "@/lib/candidates/service";
import { createStableId } from "@/lib/candidates/persistence";
import { env, envStatus } from "@/lib/config/env";
import { defaultLocale, type AppLocale } from "@/lib/i18n";
import { recordJobRun } from "@/lib/jobs/store";
import type { JobRunRecord, JobTrigger } from "@/lib/jobs/types";
import { createLogger, type AppLogger } from "@/lib/logger";
import { retryAsync } from "@/lib/utils/retry";

const logger = createLogger(env.LOG_LEVEL);

interface RunCandidateRefreshDependencies {
  loadDashboard?: typeof loadDashboardData;
  saveJobRun?: typeof recordJobRun;
  logger?: AppLogger;
  now?: () => Date;
  retry?: typeof retryAsync;
  retryLimit?: number;
  retryBackoffMs?: number;
}

export async function runCandidateRefresh(
  {
    locale = defaultLocale,
    trigger = "manual",
  }: {
    locale?: AppLocale;
    trigger?: JobTrigger;
  } = {},
  dependencies: RunCandidateRefreshDependencies = {},
): Promise<JobRunRecord> {
  const loadDashboard = dependencies.loadDashboard ?? loadDashboardData;
  const activeLogger = dependencies.logger ?? logger;
  const now = dependencies.now ?? (() => new Date());
  const saveJobRun = dependencies.saveJobRun ?? recordJobRun;
  const retry = dependencies.retry ?? retryAsync;
  const startedAt = now();

  try {
    const dashboard = await retry(
      async (attempt) => {
        activeLogger.info("Candidate refresh attempt started", {
          jobName: "candidate-refresh",
          locale,
          trigger,
          attempt,
        });

        return loadDashboard({}, locale);
      },
      {
        retries: dependencies.retryLimit ?? env.JOB_RETRY_LIMIT,
        initialDelayMs: dependencies.retryBackoffMs ?? env.JOB_RETRY_BACKOFF_MS,
        onRetry: (error, attempt, delayMs) => {
          activeLogger.warn("Candidate refresh will retry after failure", {
            jobName: "candidate-refresh",
            locale,
            trigger,
            attempt,
            delayMs,
            error: activeLogger.formatError(error),
          });
        },
      },
    );

    const finishedAt = now();
    const signalCount = dashboard.candidates.reduce((total, candidate) => total + candidate.signals.length, 0);
    const jobRun: JobRunRecord = {
      id: createStableId("job-run", "candidate-refresh", trigger, startedAt.toISOString(), locale),
      jobName: "candidate-refresh",
      trigger,
      status: "success",
      locale,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      candidateCount: dashboard.candidates.length,
      signalCount,
      connectorSummary: dashboard.connectorStatuses.map((status) => ({
        kind: status.kind,
        mode: status.mode,
        state: status.state,
      })),
      notes: envStatus.databaseConfigured
        ? "Refresh completed and snapshot persistence was attempted."
        : "Refresh completed in memory without database persistence.",
      createdAt: finishedAt.toISOString(),
    };

    await saveJobRun(jobRun);
    return jobRun;
  } catch (error) {
    const finishedAt = now();
    const jobRun: JobRunRecord = {
      id: createStableId("job-run", "candidate-refresh", trigger, startedAt.toISOString(), locale, "failed"),
      jobName: "candidate-refresh",
      trigger,
      status: "failed",
      locale,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      candidateCount: 0,
      signalCount: 0,
      connectorSummary: [],
      error: activeLogger.formatError(error),
      notes: "Refresh failed after exhausting the configured retry policy.",
      createdAt: finishedAt.toISOString(),
    };

    await saveJobRun(jobRun);
    throw error;
  }
}

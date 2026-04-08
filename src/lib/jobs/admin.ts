import { loadDashboardData } from "@/lib/candidates/service";
import { env, envStatus } from "@/lib/config/env";
import { defaultLocale, type AppLocale } from "@/lib/i18n";
import { listJobRuns } from "@/lib/jobs/store";

export async function loadAdminData(locale: AppLocale = defaultLocale) {
  const [dashboard, jobRuns] = await Promise.all([loadDashboardData({}, locale), listJobRuns(8)]);
  const signalCount = dashboard.candidates.reduce((total, candidate) => total + candidate.signals.length, 0);
  const latestObservedAt = dashboard.candidates
    .map((candidate) => candidate.lastObservedAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? null;

  return {
    dashboard,
    jobRuns,
    signalCount,
    latestObservedAt,
    scheduler: {
      enabled: env.ENABLE_SCHEDULED_JOBS,
      cron: env.REFRESH_CRON,
      retryLimit: env.JOB_RETRY_LIMIT,
      retryBackoffMs: env.JOB_RETRY_BACKOFF_MS,
      endpointPath: "/api/jobs/refresh",
      secretConfigured: envStatus.cronSecretConfigured,
    },
    persistence: {
      enabled: envStatus.databaseConfigured,
    },
  };
}

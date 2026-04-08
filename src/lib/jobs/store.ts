import { getPrismaClient, isDatabaseConfigured } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import type { JobRunRecord } from "@/lib/jobs/types";
import { env } from "@/lib/config/env";

const logger = createLogger(env.LOG_LEVEL);
const inMemoryLimit = 25;

const globalForJobRuns = globalThis as typeof globalThis & {
  jobRuns?: JobRunRecord[];
  jobRunsTableReady?: Promise<void>;
};

function getInMemoryRuns() {
  if (!globalForJobRuns.jobRuns) {
    globalForJobRuns.jobRuns = [];
  }

  return globalForJobRuns.jobRuns;
}

function saveToMemory(jobRun: JobRunRecord) {
  const runs = getInMemoryRuns();
  runs.unshift(jobRun);
  globalForJobRuns.jobRuns = runs.slice(0, inMemoryLimit);
}

async function ensureJobRunsTable() {
  if (!isDatabaseConfigured) {
    return;
  }

  if (!globalForJobRuns.jobRunsTableReady) {
    const prisma = getPrismaClient();
    globalForJobRuns.jobRunsTableReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS job_runs (
          id TEXT PRIMARY KEY,
          job_name TEXT NOT NULL,
          trigger TEXT NOT NULL,
          status TEXT NOT NULL,
          locale TEXT NOT NULL,
          started_at TIMESTAMPTZ NOT NULL,
          finished_at TIMESTAMPTZ NOT NULL,
          duration_ms INTEGER NOT NULL,
          candidate_count INTEGER NOT NULL,
          signal_count INTEGER NOT NULL,
          connector_summary JSONB NOT NULL,
          notes TEXT,
          error TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS job_runs_job_name_started_at_idx
        ON job_runs (job_name, started_at DESC)
      `);
    })();
  }

  await globalForJobRuns.jobRunsTableReady;
}

interface JobRunRow {
  id: string;
  jobName: string;
  trigger: string;
  status: string;
  locale: string;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  candidateCount: number;
  signalCount: number;
  connectorSummary: unknown;
  notes: string | null;
  error: string | null;
  createdAt: Date;
}

function normalizeJobRunRow(row: JobRunRow): JobRunRecord {
  return {
    id: row.id,
    jobName: row.jobName,
    trigger: row.trigger as JobRunRecord["trigger"],
    status: row.status as JobRunRecord["status"],
    locale: row.locale as JobRunRecord["locale"],
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt.toISOString(),
    durationMs: row.durationMs,
    candidateCount: row.candidateCount,
    signalCount: row.signalCount,
    connectorSummary: Array.isArray(row.connectorSummary) ? row.connectorSummary as JobRunRecord["connectorSummary"] : [],
    notes: row.notes ?? undefined,
    error: row.error ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function recordJobRun(jobRun: JobRunRecord) {
  saveToMemory(jobRun);

  if (!isDatabaseConfigured) {
    return;
  }

  try {
    await ensureJobRunsTable();
    const prisma = getPrismaClient();

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO job_runs (
          id,
          job_name,
          trigger,
          status,
          locale,
          started_at,
          finished_at,
          duration_ms,
          candidate_count,
          signal_count,
          connector_summary,
          notes,
          error
        ) VALUES (
          $1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz, $8, $9, $10, $11::jsonb, $12, $13
        )
      `,
      jobRun.id,
      jobRun.jobName,
      jobRun.trigger,
      jobRun.status,
      jobRun.locale,
      jobRun.startedAt,
      jobRun.finishedAt,
      jobRun.durationMs,
      jobRun.candidateCount,
      jobRun.signalCount,
      JSON.stringify(jobRun.connectorSummary),
      jobRun.notes ?? null,
      jobRun.error ?? null,
    );
  } catch (error) {
    logger.warn("Job run persistence failed; memory fallback retained the record.", {
      jobName: jobRun.jobName,
      error: logger.formatError(error),
    });
  }
}

export async function listJobRuns(limit = 10): Promise<JobRunRecord[]> {
  if (!isDatabaseConfigured) {
    return getInMemoryRuns().slice(0, limit);
  }

  try {
    await ensureJobRunsTable();
    const prisma = getPrismaClient();
    const rows = await prisma.$queryRawUnsafe<JobRunRow[]>(
      `
        SELECT
          id,
          job_name AS "jobName",
          trigger,
          status,
          locale,
          started_at AS "startedAt",
          finished_at AS "finishedAt",
          duration_ms AS "durationMs",
          candidate_count AS "candidateCount",
          signal_count AS "signalCount",
          connector_summary AS "connectorSummary",
          notes,
          error,
          created_at AS "createdAt"
        FROM job_runs
        ORDER BY started_at DESC
        LIMIT $1
      `,
      limit,
    );

    return rows.map(normalizeJobRunRow);
  } catch (error) {
    logger.warn("Job run query failed; falling back to memory records.", {
      error: logger.formatError(error),
    });
    return getInMemoryRuns().slice(0, limit);
  }
}

export function clearInMemoryJobRuns() {
  globalForJobRuns.jobRuns = [];
}

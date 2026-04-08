import type { NextRequest } from "next/server";

import { env } from "@/lib/config/env";

function extractRequestSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : undefined;

  return (
    request.headers.get("x-cron-secret") ??
    request.nextUrl.searchParams.get("secret") ??
    bearerToken ??
    undefined
  );
}

export function validateRefreshRequest(request: NextRequest) {
  if (!env.ENABLE_SCHEDULED_JOBS) {
    return {
      ok: false,
      status: 503,
      message: "Scheduled refresh jobs are disabled.",
    };
  }

  if (!env.CRON_SECRET) {
    return process.env.NODE_ENV === "production"
      ? {
          ok: false,
          status: 503,
          message: "CRON_SECRET is required in production when scheduled jobs are enabled.",
        }
      : {
          ok: true,
          status: 200,
          message: "Development request accepted without CRON_SECRET.",
        };
  }

  const requestSecret = extractRequestSecret(request);

  if (requestSecret !== env.CRON_SECRET) {
    return {
      ok: false,
      status: 401,
      message: "Invalid cron secret.",
    };
  }

  return {
    ok: true,
    status: 200,
    message: "Authorized.",
  };
}

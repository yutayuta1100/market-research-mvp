import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, type AppLocale } from "@/lib/i18n";
import { validateRefreshRequest } from "@/lib/jobs/auth";
import { runCandidateRefresh } from "@/lib/jobs/refresh-candidates";

export const dynamic = "force-dynamic";

function getLocale(request: NextRequest): AppLocale {
  const locale = request.nextUrl.searchParams.get("locale");
  return locale === "en" ? "en" : defaultLocale;
}

function getTrigger(request: NextRequest) {
  const trigger = request.nextUrl.searchParams.get("trigger");
  return trigger === "scheduled" ? "scheduled" : "api";
}

export async function GET(request: NextRequest) {
  const authorization = validateRefreshRequest(request);

  if (!authorization.ok) {
    return NextResponse.json({ ok: false, message: authorization.message }, { status: authorization.status });
  }

  try {
    const jobRun = await runCandidateRefresh({
      locale: getLocale(request),
      trigger: getTrigger(request),
    });

    return NextResponse.json({ ok: true, jobRun });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown refresh failure.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export const POST = GET;

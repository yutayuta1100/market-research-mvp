import { NextResponse, type NextRequest } from "next/server";

import { loadDashboardData } from "@/lib/candidates/service";
import { buildCandidateCsv } from "@/lib/export/candidates-csv";
import { defaultLocale, type AppLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function getLocale(request: NextRequest): AppLocale {
  const locale = request.nextUrl.searchParams.get("locale");
  return locale === "en" ? "en" : defaultLocale;
}

export async function GET(request: NextRequest) {
  const locale = getLocale(request);
  const dashboard = await loadDashboardData({}, locale);
  const csv = buildCandidateCsv(dashboard.candidates, locale);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="candidates-${locale}.csv"`,
      "cache-control": "no-store",
    },
  });
}

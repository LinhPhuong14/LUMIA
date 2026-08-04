import { NextResponse } from "next/server";

import { parseRangeKey, resolveDateRange } from "@/lib/analytics/date-range";
import { fetchGaReport } from "@/lib/analytics/ga4";
import { fetchSearchConsoleReport } from "@/lib/analytics/search-console";
import type { AnalyticsReport } from "@/lib/analytics/types";
import { getAppUrl } from "@/lib/app-url";
import { env } from "@/lib/env";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Role gating do src/proxy.ts lo (service-role check trên /api/admin/*);
  // ở đây chỉ cần chắc là có session, giống các route admin khác.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const rangeKey = parseRangeKey(new URL(request.url).searchParams.get("range"));
  const range = resolveDateRange(rangeKey);

  // Một nguồn hỏng không được kéo theo nguồn còn lại — mỗi fetch tự trả
  // SourceState riêng để UI hiện được phần nào có dữ liệu.
  const [google, searchConsole] = await Promise.all([
    fetchGaReport(range),
    fetchSearchConsoleReport(range),
  ]);

  const report: AnalyticsReport = {
    range,
    generatedAt: new Date().toISOString(),
    google,
    searchConsole,
    vercel: {
      onVercel: Boolean(process.env.VERCEL),
      environment: env.VERCEL_ENV ?? null,
      projectUrl: getAppUrl(),
      analyticsDisabled: env.NEXT_PUBLIC_ANALYTICS_DISABLED,
    },
  };

  return NextResponse.json(report);
}

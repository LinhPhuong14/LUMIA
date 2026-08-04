import { NextResponse } from "next/server";

import { fetchBusinessReport } from "@/lib/analytics/business";
import { parseRangeKey, resolveDateRange } from "@/lib/analytics/date-range";
import {
  buildDemoGaReport,
  buildDemoGscReport,
  DEMO_DEFAULT_PEAK_DAILY_USERS,
  type DemoCalibration,
} from "@/lib/analytics/demo-data";
import { fetchGaReport } from "@/lib/analytics/ga4";
import { fetchSearchConsoleReport, resolveSiteUrl } from "@/lib/analytics/search-console";
import type { AnalyticsReport, BusinessReport, SourceState } from "@/lib/analytics/types";
import { getAppUrl } from "@/lib/app-url";
import { env } from "@/lib/env";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const DEFAULT_DEMO_AGE_DAYS = 60;

function isDemoEnabled(): boolean {
  return process.env.ANALYTICS_DEMO_MODE === "true";
}

/**
 * Mốc "mở bán" cho đường tăng trưởng của dữ liệu mẫu: ưu tiên profile sớm nhất
 * trong DB để số liệu mẫu bám theo tuổi thật của site, không có thì lùi 60 ngày.
 */
function resolveCalibration(business: SourceState<BusinessReport>): DemoCalibration {
  const configured = process.env.ANALYTICS_DEMO_LAUNCH_DATE?.trim();
  const firstProfileAt = business.data?.firstProfileAt;

  const launchDate = configured
    ? new Date(configured)
    : firstProfileAt
      ? new Date(firstProfileAt)
      : new Date(Date.now() - DEFAULT_DEMO_AGE_DAYS * DAY_MS);

  const peak = Number(process.env.ANALYTICS_DEMO_PEAK_DAILY_USERS);

  return {
    launchDate: Number.isNaN(launchDate.getTime())
      ? new Date(Date.now() - DEFAULT_DEMO_AGE_DAYS * DAY_MS)
      : launchDate,
    peakDailyUsers:
      Number.isFinite(peak) && peak > 0 ? peak : DEMO_DEFAULT_PEAK_DAILY_USERS,
  };
}

export async function GET(request: Request) {
  // Role gating do src/proxy.ts lo (service-role check trên /api/admin/*);
  // ở đây chỉ cần chắc là có session, giống các route admin khác.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const rangeKey = parseRangeKey(new URL(request.url).searchParams.get("range"));
  const range = resolveDateRange(rangeKey);

  // Mỗi nguồn tự trả SourceState riêng — một nguồn hỏng không kéo theo nguồn còn lại.
  const [business, google, searchConsole] = await Promise.all([
    fetchBusinessReport(range),
    fetchGaReport(range),
    fetchSearchConsoleReport(range),
  ]);

  const report: AnalyticsReport = {
    range,
    generatedAt: new Date().toISOString(),
    business,
    google,
    searchConsole,
    vercel: {
      onVercel: Boolean(process.env.VERCEL),
      environment: env.VERCEL_ENV ?? null,
      projectUrl: getAppUrl(),
      analyticsDisabled: env.NEXT_PUBLIC_ANALYTICS_DISABLED,
    },
  };

  // Dữ liệu mẫu CHỈ lấp chỗ nguồn chưa cấu hình, và chỉ khi được bật tường minh.
  // Nguồn thật luôn thắng: đã nối được API thì không bao giờ bị thay bằng số giả,
  // kể cả khi API trả về 0. Lỗi API cũng giữ nguyên để còn biết mà sửa.
  if (isDemoEnabled()) {
    const calibration = resolveCalibration(business);

    if (google.status === "not_configured") {
      report.google = { status: "ok", demo: true, data: buildDemoGaReport(range, calibration) };
    }
    if (searchConsole.status === "not_configured") {
      report.searchConsole = {
        status: "ok",
        demo: true,
        data: buildDemoGscReport(range, calibration, resolveSiteUrl()),
      };
    }
  }

  return NextResponse.json(report);
}

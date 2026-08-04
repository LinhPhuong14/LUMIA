import { NextResponse } from "next/server";

import { fetchBusinessReport, fetchFirstProfileAt } from "@/lib/analytics/business";
import { parseRangeKey, resolveDateRange } from "@/lib/analytics/date-range";
import {
  buildDemoGaReport,
  buildDemoGscReport,
  DEMO_DEFAULT_PEAK_DAILY_USERS,
  type DemoCalibration,
} from "@/lib/analytics/demo-data";
import { fetchGaReport } from "@/lib/analytics/ga4";
import { fetchSearchConsoleReport, resolveSiteUrl } from "@/lib/analytics/search-console";
import type { AnalyticsReport } from "@/lib/analytics/types";
import { getAppUrl } from "@/lib/app-url";
import { env } from "@/lib/env";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const DEFAULT_DEMO_AGE_DAYS = 60;

/**
 * Dữ liệu mẫu bật sẵn để tab báo cáo không trống khi chưa nối được API Google.
 * Đặt `ANALYTICS_DEMO_MODE=false` để tắt hẳn — lúc đó nguồn chưa cấu hình sẽ
 * hiện hướng dẫn thay vì số mẫu.
 */
function isDemoEnabled(): boolean {
  return process.env.ANALYTICS_DEMO_MODE !== "false";
}

/**
 * Mốc "mở bán" cho đường tăng trưởng của dữ liệu mẫu: ưu tiên profile sớm nhất
 * trong DB để số liệu mẫu bám theo tuổi thật của site, không có thì lùi 60 ngày.
 */
function resolveCalibration(firstProfileAt: string | null): DemoCalibration {
  const configured = process.env.ANALYTICS_DEMO_LAUNCH_DATE?.trim();

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
    peakDailyUsers: Number.isFinite(peak) && peak > 0 ? peak : DEMO_DEFAULT_PEAK_DAILY_USERS,
  };
}

/** `?sections=business,traffic` — bỏ trống thì trả tất cả. */
function parseSections(raw: string | null): { business: boolean; traffic: boolean } {
  if (!raw) {
    return { business: true, traffic: true };
  }
  const requested = raw.split(",").map((value) => value.trim());
  return {
    business: requested.includes("business"),
    traffic: requested.includes("traffic"),
  };
}

export async function GET(request: Request) {
  // Role gating do src/proxy.ts lo (service-role check trên /api/admin/*);
  // ở đây chỉ cần chắc là có session, giống các route admin khác.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const range = resolveDateRange(parseRangeKey(params.get("range")));
  const sections = parseSections(params.get("sections"));

  // Mỗi nguồn tự trả SourceState riêng — một nguồn hỏng không kéo theo nguồn còn lại.
  // Chỉ gọi những nguồn được yêu cầu: tab chỉ xem doanh thu không phải chờ hai
  // vòng gọi API Google mà nó không hiển thị.
  const [business, google, searchConsole] = await Promise.all([
    sections.business ? fetchBusinessReport(range) : null,
    sections.traffic ? fetchGaReport(range) : null,
    sections.traffic ? fetchSearchConsoleReport(range) : null,
  ]);

  const report: AnalyticsReport = {
    range,
    generatedAt: new Date().toISOString(),
    // Mặc định ẩn nhãn; đặt ANALYTICS_DEMO_SHOW_LABEL=true để hiện lại.
    showDemoLabel: process.env.ANALYTICS_DEMO_SHOW_LABEL === "true",
  };

  if (business) {
    report.business = business;
  }

  if (sections.traffic) {
    report.google = google ?? undefined;
    report.searchConsole = searchConsole ?? undefined;
    report.vercel = {
      onVercel: Boolean(process.env.VERCEL),
      environment: env.VERCEL_ENV ?? null,
      projectUrl: getAppUrl(),
      analyticsDisabled: env.NEXT_PUBLIC_ANALYTICS_DISABLED,
    };

    // Dữ liệu mẫu CHỈ lấp chỗ nguồn chưa cấu hình. Nguồn thật luôn thắng: đã nối
    // được API thì không bao giờ bị thay bằng số mẫu, kể cả khi API trả về 0.
    // Nguồn đang lỗi cũng giữ nguyên lỗi để còn biết mà sửa.
    const needsDemo =
      isDemoEnabled() &&
      (google?.status === "not_configured" || searchConsole?.status === "not_configured");

    if (needsDemo) {
      // Tab Vận hành không kéo báo cáo doanh thu, nên lấy mốc mở bán bằng một
      // query nhỏ riêng thay vì để rơi về mặc định 60 ngày.
      const firstProfileAt =
        business?.data?.firstProfileAt ?? (business ? null : await fetchFirstProfileAt());
      const calibration = resolveCalibration(firstProfileAt);

      if (google?.status === "not_configured") {
        report.google = { status: "ok", demo: true, data: buildDemoGaReport(range, calibration) };
      }
      if (searchConsole?.status === "not_configured") {
        report.searchConsole = {
          status: "ok",
          demo: true,
          data: buildDemoGscReport(range, calibration, resolveSiteUrl()),
        };
      }
    }
  }

  return NextResponse.json(report);
}

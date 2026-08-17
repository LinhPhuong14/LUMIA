import { NextResponse } from "next/server";

import {
  ensureBackfilled,
  resolveCutoverDate,
  type BackfillOutcome,
} from "@/lib/analytics/auto-backfill";
import { ANCHOR_MIN_REAL_DAYS, isBeforeCutover } from "@/lib/analytics/backfill";
import { fetchBusinessReport, fetchDemoAnchors } from "@/lib/analytics/business";
import { parseRangeKey, resolveDateRange } from "@/lib/analytics/date-range";
import {
  buildDemoGaRealtime,
  buildDemoGaReport,
  buildDemoGscReport,
  calibrateForSignups,
  DEMO_DEFAULT_PEAK_DAILY_USERS,
  type DemoCalibration,
} from "@/lib/analytics/demo-data";
import { fillGaGaps, fillGscGaps, isGscEmpty } from "@/lib/analytics/fill-gaps";
import { fetchGaRealtime, fetchGaReport } from "@/lib/analytics/ga4";
import { applyMockDates, resolveMockDates } from "@/lib/analytics/mock-override";
import { fetchSearchConsoleReport, resolveSiteUrl } from "@/lib/analytics/search-console";
import { readSnapshot } from "@/lib/analytics/snapshot";
import {
  selectHistorical,
  spliceGaSummary,
  spliceTrend,
} from "@/lib/analytics/splice";
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

/**
 * Bản tạm và bản đã neo trông giống hệt nhau trên biểu đồ, nên câu trạng thái là
 * chỗ duy nhất phân biệt được. Nói thẳng ra để không ai tưởng số đã chuẩn.
 */
function describeBackfillRun(outcome: Extract<BackfillOutcome, { ran: true }>): string {
  const span = `${outcome.written} ngày lịch sử (${outcome.from} → ${outcome.to})`;
  return outcome.scaleFactor === null
    ? `Đã dựng tạm ${span} theo quy mô mặc định. Sẽ tự neo lại về mức traffic thật khi có đủ ${ANCHOR_MIN_REAL_DAYS} ngày dữ liệu GA4.`
    : `Đã dựng ${span}, hệ số neo ${outcome.scaleFactor.toFixed(2)}.`;
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
  // Tab Vận hành gửi includeToday=1 để cột cuối là hôm nay; Báo cáo bỏ qua và
  // giữ mốc hôm qua. Key "today" tự bao gồm hôm nay bất kể cờ.
  const includeToday = params.get("includeToday") === "1";
  const range = resolveDateRange(parseRangeKey(params.get("range")), new Date(), includeToday);
  const sections = parseSections(params.get("sections"));

  // Mỗi nguồn tự trả SourceState riêng — một nguồn hỏng không kéo theo nguồn còn lại.
  // Chỉ gọi những nguồn được yêu cầu: tab chỉ xem doanh thu không phải chờ hai
  // vòng gọi API Google mà nó không hiển thị.
  const [business, google, searchConsole, realtime] = await Promise.all([
    sections.business ? fetchBusinessReport(range) : null,
    sections.traffic ? fetchGaReport(range) : null,
    sections.traffic ? fetchSearchConsoleReport(range) : null,
    sections.traffic ? fetchGaRealtime() : null,
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
    report.realtime = realtime ?? undefined;
    report.vercel = {
      onVercel: Boolean(process.env.VERCEL),
      environment: env.VERCEL_ENV ?? null,
      projectUrl: getAppUrl(),
      analyticsDisabled: env.NEXT_PUBLIC_ANALYTICS_DISABLED,
    };

    // Quy mô của bộ sinh số mẫu. Dùng ở hai chỗ (lấp cả nguồn, và lấp khối rỗng
    // của nguồn thật) nhưng chỉ tính khi thật sự cần: nó tốn một query đếm tài
    // khoản, mà đường đi thường gặp nhất là mọi thứ đã có số thật.
    let cachedCalibration: DemoCalibration | null = null;
    const getCalibration = async (): Promise<DemoCalibration> => {
      if (!cachedCalibration) {
        // Tab Vận hành không kéo báo cáo doanh thu, nên lấy mốc neo bằng một
        // query nhỏ riêng thay vì để rơi về mặc định 60 ngày.
        const anchors = business?.data
          ? { firstProfileAt: business.data.firstProfileAt, signups: business.data.signups }
          : await fetchDemoAnchors(range);

        // Nâng quy mô cho đủ phủ số tài khoản thật, nếu không báo cáo sẽ hiện
        // nhiều người đăng ký hơn người ghé thăm.
        cachedCalibration = calibrateForSignups(
          range,
          resolveCalibration(anchors.firstProfileAt),
          anchors.signups,
        );
      }
      return cachedCalibration;
    };

    // Dữ liệu mẫu CHỈ lấp chỗ nguồn chưa cấu hình. Nguồn thật luôn thắng: đã nối
    // được API thì không bao giờ bị thay bằng số mẫu, kể cả khi API trả về 0.
    // Nguồn đang lỗi cũng giữ nguyên lỗi để còn biết mà sửa.
    const needsDemo =
      isDemoEnabled() &&
      (google?.status === "not_configured" || searchConsole?.status === "not_configured");

    if (needsDemo) {
      const calibration = await getCalibration();

      if (google?.status === "not_configured") {
        report.google = { status: "ok", demo: true, data: buildDemoGaReport(range, calibration) };
      }
      if (realtime?.status === "not_configured") {
        report.realtime = { status: "ok", demo: true, data: buildDemoGaRealtime(calibration) };
      }
      if (searchConsole?.status === "not_configured") {
        report.searchConsole = {
          status: "ok",
          demo: true,
          data: buildDemoGscReport(range, calibration, resolveSiteUrl()),
        };
      }
    }

    // Thay riêng các ngày đã lỡ trộn data test load-test bằng số mockup. Danh
    // sách bake sẵn (14-17/8) trong mock-override, ghi đè được qua env
    // ANALYTICS_MOCK_GA_DATES. Chỉ đụng nguồn GA4 THẬT (không phải demo), làm
    // TRƯỚC bước nối lịch sử để mọi xử lý sau đó thao tác trên số đã vá.
    const mockDates = resolveMockDates(process.env.ANALYTICS_MOCK_GA_DATES);
    const gaReal = report.google;
    if (mockDates.size > 0 && gaReal?.status === "ok" && gaReal.data && !gaReal.demo) {
      report.google = { ...gaReal, data: applyMockDates(gaReal.data, mockDates) };
    }

    // Nối lịch sử đã đóng băng vào đầu kỳ, khi đã cắt sang số thật.
    //
    // Chỉ làm cho GA4: Search Console trả về tới 16 tháng lịch sử lúc verify
    // property, nên phần tìm kiếm đã là số thật, nối vào chỉ làm hỏng.
    const ga = report.google;

    if (ga?.status === "ok" && ga.data && !ga.demo) {
      // Mốc gắn đo tự suy từ dữ liệu GA4 khi không đặt env, và lịch sử tự dựng
      // lần đầu đủ điều kiện — không cần ai bấm nút.
      const cutoverDate = await resolveCutoverDate();
      const outcome = await ensureBackfilled(cutoverDate);
      report.backfill = {
        ran: outcome.ran,
        reason: outcome.ran ? undefined : outcome.reason,
        note: outcome.ran ? describeBackfillRun(outcome) : outcome.note,
        cutoverDate: outcome.cutoverDate ?? cutoverDate,
        provisional: outcome.provisional === true,
      };

      if (cutoverDate && isBeforeCutover(range.startDate, cutoverDate)) {
        const historical = selectHistorical(
          await readSnapshot(range.startDate, range.endDate),
          range.startDate,
          range.endDate,
          cutoverDate,
        );

        if (historical.length > 0) {
          report.google = {
            ...ga,
            spliced: true,
            realDataSince: cutoverDate,
            data: {
              ...ga.data,
              summary: spliceGaSummary(historical, ga.data.summary),
              // Tỉ trọng nguồn/thiết bị/quốc gia và top trang giữ nguyên bản thật:
              // cơ cấu đo được đáng tin hơn cơ cấu dựng lại, và trộn hai bộ tỉ
              // trọng khác nhau chỉ tạo ra một phân bố không thuộc về ai.
              //
              // Bỏ mọi điểm thật trước mốc: ngày cài tag chỉ chạy vài giờ nên
              // số thấp bất thường, để lọt vào sẽ thành hố sụt ngay chỗ nối.
              trend: spliceTrend(
                historical,
                ga.data.trend.filter((point) => point.date >= cutoverDate),
              ),
            },
          };
        }
      }
    }

    // Lấp những khối cơ cấu mà API thật trả rỗng.
    //
    // Chạy SAU khi nối lịch sử, vì phần lấp co theo tổng đang hiển thị — làm
    // trước thì nó co theo tổng chưa nối và cộng các dòng lại sẽ không khớp ô
    // tổng ngay bên trên. Chỉ đụng vào nguồn thật: nguồn đã là số mẫu thì đủ
    // sẵn, còn nguồn lỗi/chưa cấu hình phải giữ nguyên trạng thái để còn sửa.
    if (isDemoEnabled()) {
      const gaState = report.google;
      if (gaState?.status === "ok" && gaState.data && !gaState.demo) {
        const { report: patched, filled } = fillGaGaps(
          gaState.data,
          buildDemoGaReport(range, await getCalibration()),
        );
        if (filled.length > 0) {
          report.google = { ...gaState, data: patched, filled };
        }
      }

      const gscState = report.searchConsole;
      const gsc = gscState?.status === "ok" && !gscState.demo ? gscState.data : null;

      if (gscState && gsc && isGscEmpty(gsc)) {
        const demo = buildDemoGscReport(range, await getCalibration(), gsc.siteUrl);
        report.searchConsole = {
          ...gscState,
          data: fillGscGaps(gsc, demo),
          filled: ["summary", "trend", "topQueries", "topPages"],
        };
      }
    }
  }

  return NextResponse.json(report);
}

import { NextResponse } from "next/server";

import {
  ANCHOR_MIN_REAL_DAYS,
  resolveAnchor,
  resolveBackfillEnd,
} from "@/lib/analytics/backfill";
import { fetchFirstProfileAt } from "@/lib/analytics/business";
import { toIsoDate } from "@/lib/analytics/date-range";
import {
  buildDemoDailySeries,
  DEMO_DEFAULT_PEAK_DAILY_USERS,
  type DemoCalibration,
} from "@/lib/analytics/demo-data";
import { fetchGaDailyUsers } from "@/lib/analytics/ga4";
import { getSnapshotStats, replaceDemoSnapshot, type SnapshotRow } from "@/lib/analytics/snapshot";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;
const DEFAULT_DEMO_AGE_DAYS = 60;

function getCutoverDate(): string | null {
  const raw = process.env.ANALYTICS_REAL_DATA_SINCE?.trim();
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

/** Hôm qua — GA4 chưa chốt số của hôm nay nên ngày đó không dùng để neo. */
function yesterday(): string {
  return toIsoDate(new Date(Date.now() - DAY_MS));
}

async function resolveCalibration(): Promise<DemoCalibration> {
  const configured = process.env.ANALYTICS_DEMO_LAUNCH_DATE?.trim();
  const source = configured ?? (await fetchFirstProfileAt());
  const launchDate = source ? new Date(source) : new Date(Date.now() - DEFAULT_DEMO_AGE_DAYS * DAY_MS);
  const peak = Number(process.env.ANALYTICS_DEMO_PEAK_DAILY_USERS);

  return {
    launchDate: Number.isNaN(launchDate.getTime())
      ? new Date(Date.now() - DEFAULT_DEMO_AGE_DAYS * DAY_MS)
      : launchDate,
    peakDailyUsers: Number.isFinite(peak) && peak > 0 ? peak : DEMO_DEFAULT_PEAK_DAILY_USERS,
  };
}

/**
 * Tính trạng thái neo: đã đủ ngày thật chưa, hệ số co giãn là bao nhiêu.
 * Dùng chung cho cả GET (xem trạng thái) và POST (chốt và ghi).
 */
async function computeAnchor() {
  const cutover = getCutoverDate();
  const backfillEnd = resolveBackfillEnd(cutover);
  const calibration = await resolveCalibration();

  if (!cutover || !backfillEnd) {
    return {
      cutover,
      backfillEnd,
      calibration,
      anchor: resolveAnchor({ hasCutover: false, realDailyUsers: [], demoDailyUsers: [] }),
    };
  }

  // Chỉ lấy tới hôm qua: ngày hôm nay còn đang chạy, đưa vào sẽ kéo tụt trung bình.
  const realWindowEnd = yesterday();
  const realDaily =
    realWindowEnd >= cutover ? await fetchGaDailyUsers(cutover, realWindowEnd) : [];

  // So số mẫu trên ĐÚNG những ngày có số thật — đường tăng trưởng dốc theo tuổi
  // site, so với mốc khác sẽ ra hệ số lệch.
  const demoDaily =
    realDaily.length > 0
      ? buildDemoDailySeries(realDaily[0].date, realDaily[realDaily.length - 1].date, calibration)
      : [];

  return {
    cutover,
    backfillEnd,
    calibration,
    anchor: resolveAnchor({
      hasCutover: true,
      realDailyUsers: realDaily.map((point) => point.users),
      demoDailyUsers: demoDaily.map((point) => point.users),
    }),
  };
}

/** Trạng thái neo + lịch sử đã đóng băng. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { cutover, backfillEnd, anchor } = await computeAnchor();
  const snapshot = await getSnapshotStats();

  return NextResponse.json({
    cutoverDate: cutover,
    backfillEnd,
    minRealDays: ANCHOR_MIN_REAL_DAYS,
    anchor,
    snapshot,
  });
}

/** Chốt hệ số và ghi đè đoạn lịch sử dựng lại. */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const { cutover, backfillEnd, calibration, anchor } = await computeAnchor();

  if (!anchor.ready) {
    const messages: Record<string, string> = {
      no_cutover: "Chưa đặt ANALYTICS_REAL_DATA_SINCE — không biết mốc nào là ngày gắn đo.",
      not_enough_days: `Mới có ${anchor.realDays}/${ANCHOR_MIN_REAL_DAYS} ngày dữ liệu thật.`,
      no_baseline: "Chưa đo được traffic thật nào — kiểm tra lại tag GA4 trước khi neo.",
    };
    return NextResponse.json(
      { error: messages[anchor.reason] ?? "Chưa neo được.", anchor },
      { status: 409 },
    );
  }

  const scaled: DemoCalibration = {
    ...calibration,
    peakDailyUsers: calibration.peakDailyUsers * anchor.scaleFactor,
  };

  const launchIso = toIsoDate(calibration.launchDate);
  if (!backfillEnd || launchIso > backfillEnd) {
    return NextResponse.json(
      { error: "Không có ngày nào trước mốc gắn đo để dựng lại." },
      { status: 409 },
    );
  }

  const rows: SnapshotRow[] = buildDemoDailySeries(launchIso, backfillEnd, scaled).map((point) => ({
    date: point.date,
    source: "demo" as const,
    users: point.users,
    newUsers: point.newUsers,
    sessions: point.sessions,
    pageViews: point.pageViews,
    engagementRate: Number(point.engagementRate.toFixed(5)),
    avgSessionSeconds: Number(point.sessionSeconds.toFixed(2)),
    clicks: point.clicks,
    impressions: point.impressions,
  }));

  const { written, error } = await replaceDemoSnapshot(rows, anchor.scaleFactor);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    cutoverDate: cutover,
    written,
    scaleFactor: anchor.scaleFactor,
    realDays: anchor.realDays,
    realDailyAverage: anchor.realDailyAverage,
    range: { from: launchIso, to: backfillEnd },
  });
}

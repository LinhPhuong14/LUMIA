import "server-only";

import {
  ANCHOR_MIN_REAL_DAYS,
  inferCutoverDate,
  resolveAnchor,
  resolveBackfillEnd,
  type AnchorStatus,
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

/**
 * Nối lịch sử tự động: không cần đặt env thủ công, không cần bấm nút.
 *
 * Chạy lười khi báo cáo được mở — điều kiện đủ chỉ xảy ra một lần nên gần như
 * mọi request về sau đều thoát ngay ở bước kiểm tra snapshot.
 */

const DAY_MS = 86_400_000;
const DEFAULT_DEMO_AGE_DAYS = 60;

/** Nhìn lùi đủ xa để bắt được ngày gắn tag, kể cả khi mở báo cáo sau vài tháng. */
const CUTOVER_LOOKBACK_DAYS = 400;

function shiftDays(days: number): string {
  return toIsoDate(new Date(Date.now() + days * DAY_MS));
}

/**
 * Mốc gắn đo: ưu tiên env, không có thì suy thẳng từ dữ liệu GA4.
 *
 * Kết quả được nhớ trong tiến trình vì nó gần như bất biến — hỏi lại GA4 mỗi
 * request chỉ tốn thêm một vòng API cho một con số không đổi.
 */
let cachedCutover: { value: string | null; at: number } | null = null;
const CUTOVER_CACHE_MS = 30 * 60_000;

export async function resolveCutoverDate(): Promise<string | null> {
  const configured = process.env.ANALYTICS_REAL_DATA_SINCE?.trim();
  if (configured && /^\d{4}-\d{2}-\d{2}$/.test(configured)) {
    return configured;
  }

  if (cachedCutover && Date.now() - cachedCutover.at < CUTOVER_CACHE_MS) {
    return cachedCutover.value;
  }

  const daily = await fetchGaDailyUsers(shiftDays(-CUTOVER_LOOKBACK_DAYS), shiftDays(-1));
  const value = inferCutoverDate(daily);
  cachedCutover = { value, at: Date.now() };
  return value;
}

async function resolveCalibration(): Promise<DemoCalibration> {
  const configured = process.env.ANALYTICS_DEMO_LAUNCH_DATE?.trim();
  const source = configured ?? (await fetchFirstProfileAt());
  const launchDate = source
    ? new Date(source)
    : new Date(Date.now() - DEFAULT_DEMO_AGE_DAYS * DAY_MS);
  const peak = Number(process.env.ANALYTICS_DEMO_PEAK_DAILY_USERS);

  return {
    launchDate: Number.isNaN(launchDate.getTime())
      ? new Date(Date.now() - DEFAULT_DEMO_AGE_DAYS * DAY_MS)
      : launchDate,
    peakDailyUsers: Number.isFinite(peak) && peak > 0 ? peak : DEMO_DEFAULT_PEAK_DAILY_USERS,
  };
}

export type BackfillOutcome =
  | { ran: false; reason: "no_cutover" | "not_ready" | "already_done" | "nothing_to_fill" }
  | { ran: true; written: number; scaleFactor: number; from: string; to: string };

export async function computeAnchorStatus(cutover: string | null): Promise<{
  anchor: AnchorStatus;
  calibration: DemoCalibration;
  backfillEnd: string | null;
}> {
  const calibration = await resolveCalibration();
  const backfillEnd = resolveBackfillEnd(cutover);

  if (!cutover || !backfillEnd) {
    return {
      calibration,
      backfillEnd,
      anchor: resolveAnchor({ hasCutover: false, realDailyUsers: [], demoDailyUsers: [] }),
    };
  }

  // Chỉ tới hôm qua: hôm nay còn đang chạy, đưa vào sẽ kéo tụt trung bình.
  const realWindowEnd = shiftDays(-1);
  const realDaily =
    realWindowEnd >= cutover ? await fetchGaDailyUsers(cutover, realWindowEnd) : [];

  // So trên ĐÚNG những ngày có số thật — đường tăng trưởng dốc theo tuổi site,
  // so với mốc khác sẽ ra hệ số lệch.
  const demoDaily =
    realDaily.length > 0
      ? buildDemoDailySeries(realDaily[0].date, realDaily[realDaily.length - 1].date, calibration)
      : [];

  return {
    calibration,
    backfillEnd,
    anchor: resolveAnchor({
      hasCutover: true,
      realDailyUsers: realDaily.map((point) => point.users),
      demoDailyUsers: demoDaily.map((point) => point.users),
    }),
  };
}

export async function runBackfill(cutover: string | null): Promise<BackfillOutcome> {
  if (!cutover) {
    return { ran: false, reason: "no_cutover" };
  }

  const { anchor, calibration, backfillEnd } = await computeAnchorStatus(cutover);
  if (!anchor.ready || !backfillEnd) {
    return { ran: false, reason: "not_ready" };
  }

  const launchIso = toIsoDate(calibration.launchDate);
  if (launchIso > backfillEnd) {
    return { ran: false, reason: "nothing_to_fill" };
  }

  const scaled: DemoCalibration = {
    ...calibration,
    peakDailyUsers: calibration.peakDailyUsers * anchor.scaleFactor,
  };

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
    throw new Error(error);
  }

  return {
    ran: true,
    written,
    scaleFactor: anchor.scaleFactor,
    from: launchIso,
    to: backfillEnd,
  };
}

/**
 * Khoá chống chạy chồng: hai request cùng lúc mà cùng thấy snapshot rỗng sẽ
 * cùng dựng lại lịch sử, và `replaceDemoSnapshot` xoá trước khi chèn nên hai
 * lượt đan vào nhau có thể để lại bảng thiếu ngày.
 */
let inFlight: Promise<BackfillOutcome> | null = null;

/**
 * Nối lịch sử nếu đủ điều kiện và chưa từng nối. Nuốt mọi lỗi: đây là việc phụ
 * chạy kèm lúc mở báo cáo, hỏng thì báo cáo vẫn phải hiện được phần còn lại.
 */
export async function ensureBackfilled(cutover: string | null): Promise<BackfillOutcome> {
  if (!cutover) {
    return { ran: false, reason: "no_cutover" };
  }

  const stats = await getSnapshotStats();
  if (stats.demoDays > 0) {
    return { ran: false, reason: "already_done" };
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = runBackfill(cutover)
    .catch((): BackfillOutcome => ({ ran: false, reason: "not_ready" }))
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export { ANCHOR_MIN_REAL_DAYS };

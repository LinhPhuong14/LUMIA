import "server-only";

import {
  ANCHOR_MIN_REAL_DAYS,
  inferCutoverDate,
  parseCutoverEnv,
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

/** Lỗi định dạng của env, giữ lại để hiện lên báo cáo thay vì bỏ qua lặng lẽ. */
let cutoverEnvError: string | null = null;

export function getCutoverEnvError(): string | null {
  return cutoverEnvError;
}

export async function resolveCutoverDate(): Promise<string | null> {
  const configured = parseCutoverEnv(process.env.ANALYTICS_REAL_DATA_SINCE);
  cutoverEnvError = configured.kind === "invalid" ? configured.reason : null;

  if (configured.kind === "ok") {
    return configured.date;
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
  | {
      ran: false;
      reason: "no_cutover" | "not_ready" | "already_done" | "nothing_to_fill" | "failed";
      /** Câu giải thích hiện thẳng lên báo cáo, để không phải đi đoán. */
      note?: string;
      realDays?: number;
      cutoverDate?: string | null;
      /** Lịch sử đang là bản tạm, chờ đủ ngày thật để neo lại. */
      provisional?: boolean;
    }
  | {
      ran: true;
      written: number;
      /** `null` = dựng tạm bằng quy mô mặc định, chưa neo vào traffic thật. */
      scaleFactor: number | null;
      from: string;
      to: string;
      cutoverDate: string;
      provisional: boolean;
    };

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

/**
 * Dựng lịch sử trước mốc gắn đo.
 *
 * Hai việc tách rời: **dựng** đoạn lịch sử chỉ cần biết mốc gắn đo, còn **neo**
 * nó về đúng mức traffic thật mới cần 3 ngày dữ liệu GA4. Gộp hai điều kiện lại
 * thì biểu đồ trống trơn suốt mấy ngày đầu — kể cả khi mốc nằm ở tương lai, lúc
 * đó không đời nào đủ ngày thật. Nên khi chưa neo được, vẫn dựng bằng quy mô mặc
 * định và đánh dấu `scale_factor = NULL`; đủ ngày thì `ensureBackfilled` dựng lại
 * bằng hệ số thật.
 *
 * `requireAnchor` dùng cho lượt neo lại: đã có bản tạm rồi thì đừng ghi đè bằng
 * một bản tạm y hệt ở mỗi request.
 */
export async function runBackfill(
  cutover: string | null,
  options: { requireAnchor?: boolean } = {},
): Promise<BackfillOutcome> {
  if (!cutover) {
    return {
      ran: false,
      reason: "no_cutover",
      note: "Chưa đo được ngày nào có người dùng trong GA4 nên chưa biết mốc gắn đo ở đâu.",
      cutoverDate: null,
    };
  }

  const { anchor, calibration, backfillEnd } = await computeAnchorStatus(cutover);

  if (!backfillEnd) {
    return {
      ran: false,
      reason: "nothing_to_fill",
      cutoverDate: cutover,
      note: `Mốc gắn đo "${cutover}" không đọc được thành ngày nên không biết dựng lại tới đâu.`,
    };
  }

  if (!anchor.ready && options.requireAnchor) {
    return {
      ran: false,
      reason: "not_ready",
      realDays: anchor.realDays,
      cutoverDate: cutover,
      provisional: true,
      note: `Cần ${ANCHOR_MIN_REAL_DAYS} ngày dữ liệu GA4 thật để neo, hiện có ${anchor.realDays}.`,
    };
  }

  const launchIso = toIsoDate(calibration.launchDate);
  if (launchIso > backfillEnd) {
    return {
      ran: false,
      reason: "nothing_to_fill",
      cutoverDate: cutover,
      note: `Không có ngày nào trước mốc gắn đo ${cutover} để dựng lại.`,
    };
  }

  const scaleFactor = anchor.ready ? anchor.scaleFactor : null;
  const scaled: DemoCalibration = {
    ...calibration,
    peakDailyUsers: calibration.peakDailyUsers * (scaleFactor ?? 1),
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

  const { written, error } = await replaceDemoSnapshot(rows, scaleFactor);
  if (error) {
    throw new Error(error);
  }

  return {
    ran: true,
    written,
    scaleFactor,
    from: launchIso,
    to: backfillEnd,
    cutoverDate: cutover,
    provisional: scaleFactor === null,
  };
}

/**
 * Khoá chống chạy chồng: hai request cùng lúc mà cùng thấy snapshot rỗng sẽ
 * cùng dựng lại lịch sử, và `replaceDemoSnapshot` xoá trước khi chèn nên hai
 * lượt đan vào nhau có thể để lại bảng thiếu ngày.
 */
let inFlight: Promise<BackfillOutcome> | null = null;

/**
 * Giãn nhịp hỏi lại GA4 xem đã đủ ngày để neo chưa. Bản tạm đã hiện được biểu đồ
 * rồi, nên neo trễ nửa tiếng không ai thấy — còn hỏi mỗi request thì thêm một
 * vòng gọi API cho một câu trả lời gần như luôn là "chưa".
 */
const REANCHOR_CHECK_MS = 30 * 60_000;
let lastReanchorCheckAt = 0;

/**
 * Nối lịch sử nếu đủ điều kiện và chưa từng nối. Nuốt mọi lỗi: đây là việc phụ
 * chạy kèm lúc mở báo cáo, hỏng thì báo cáo vẫn phải hiện được phần còn lại.
 */
export async function ensureBackfilled(cutover: string | null): Promise<BackfillOutcome> {
  const stats = await getSnapshotStats();

  // Bảng chưa tồn tại thì có chạy cũng không ghi được — nói thẳng thay vì nuốt.
  if (stats.error) {
    return { ran: false, reason: "failed", note: stats.error, cutoverDate: cutover };
  }

  const period = `${stats.firstDate} → ${stats.lastDate}`;

  if (stats.demoDays > 0 && stats.anchored) {
    return {
      ran: false,
      reason: "already_done",
      cutoverDate: cutover,
      note: `Đã dựng ${stats.demoDays} ngày lịch sử (${period}), đã neo về mức traffic thật.`,
    };
  }

  if (!cutover) {
    return {
      ran: false,
      reason: "no_cutover",
      cutoverDate: null,
      note:
        getCutoverEnvError() ??
        "GA4 chưa có ngày trọn vẹn nào có người dùng nên chưa suy được mốc gắn đo. Dữ liệu vào Data API chậm hơn Realtime khoảng 24-48h — chờ thêm, hoặc đặt ANALYTICS_REAL_DATA_SINCE=YYYY-MM-DD để chỉ định thẳng.",
    };
  }

  // Đã có bản tạm: chỉ ghi lại khi đã đủ ngày thật để neo, và không hỏi GA4 quá dày.
  const hasProvisional = stats.demoDays > 0;
  if (hasProvisional && Date.now() - lastReanchorCheckAt < REANCHOR_CHECK_MS) {
    return {
      ran: false,
      reason: "already_done",
      cutoverDate: cutover,
      provisional: true,
      note: `Đã dựng tạm ${stats.demoDays} ngày lịch sử (${period}) theo quy mô mặc định. Sẽ tự neo lại về mức traffic thật khi có đủ ${ANCHOR_MIN_REAL_DAYS} ngày dữ liệu GA4.`,
    };
  }

  if (inFlight) {
    return inFlight;
  }

  if (hasProvisional) {
    lastReanchorCheckAt = Date.now();
  }

  inFlight = runBackfill(cutover, { requireAnchor: hasProvisional })
    .then((outcome): BackfillOutcome => {
      if (!outcome.ran && outcome.reason === "not_ready" && hasProvisional) {
        return {
          ...outcome,
          note: `${outcome.note} Lịch sử ${stats.demoDays} ngày (${period}) đang dùng quy mô mặc định, sẽ tự neo lại khi đủ.`,
        };
      }
      return outcome;
    })
    .catch(
      (error): BackfillOutcome => ({
        ran: false,
        reason: "failed",
        cutoverDate: cutover,
        note: error instanceof Error ? error.message : "Không ghi được lịch sử.",
      }),
    )
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export { ANCHOR_MIN_REAL_DAYS };

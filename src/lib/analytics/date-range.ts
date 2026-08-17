export const RANGE_KEYS = ["7d", "28d", "90d"] as const;

/**
 * Bộ khoảng ngày cho tab Vận hành — có thêm "Hôm nay" và mặc định bao gồm cả
 * ngày hôm nay (xem `includeToday`). Tab Báo cáo vẫn dùng RANGE_KEYS và kết
 * thúc ở hôm qua để cột cuối không tụt về 0 làm sai so sánh %.
 */
export const OPERATIONS_RANGE_KEYS = ["today", "7d", "28d", "90d"] as const;

export type RangeKey = "today" | (typeof RANGE_KEYS)[number];

export type DateRange = {
  key: RangeKey;
  days: number;
  /** Kỳ hiện tại, YYYY-MM-DD */
  startDate: string;
  endDate: string;
  /** Kỳ liền trước, cùng độ dài — dùng để tính % thay đổi */
  previousStartDate: string;
  previousEndDate: string;
};

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Hôm nay",
  "7d": "7 ngày",
  "28d": "28 ngày",
  "90d": "90 ngày",
};

const RANGE_DAYS: Record<RangeKey, number> = {
  today: 1,
  "7d": 7,
  "28d": 28,
  "90d": 90,
};

const ALL_RANGE_KEYS: readonly RangeKey[] = ["today", "7d", "28d", "90d"];

export function isRangeKey(value: unknown): value is RangeKey {
  return typeof value === "string" && (ALL_RANGE_KEYS as readonly string[]).includes(value);
}

export function parseRangeKey(value: unknown, fallback: RangeKey = "28d"): RangeKey {
  return isRangeKey(value) ? value : fallback;
}

/** YYYY-MM-DD theo UTC — định dạng GA4 và Search Console đều dùng. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/**
 * Mặc định khoảng ngày kết thúc ở **hôm qua**: GA4 chưa chốt dữ liệu của hôm
 * nay, còn Search Console trễ tới 2-3 ngày, nên lấy tới hôm nay chỉ tạo ra một
 * cột cuối luôn tụt xuống 0 và làm sai % so sánh — đó là lựa chọn của tab Báo cáo.
 *
 * Tab Vận hành cần thấy tình hình đang diễn ra nên truyền `includeToday`, và
 * key "today" thì luôn là hôm nay bất kể cờ. Đánh đổi: cột cuối là ngày chưa
 * trọn nên thấp hơn thực tế — chấp nhận được cho một màn hình theo dõi trực tiếp.
 */
export function resolveDateRange(
  key: RangeKey,
  today: Date = new Date(),
  includeToday = false,
): DateRange {
  const days = RANGE_DAYS[key];
  const endsToday = key === "today" || includeToday;
  const end = endsToday ? today : shiftDays(today, -1);
  const start = shiftDays(end, -(days - 1));
  const previousEnd = shiftDays(start, -1);
  const previousStart = shiftDays(previousEnd, -(days - 1));

  return {
    key,
    days,
    startDate: toIsoDate(start),
    endDate: toIsoDate(end),
    previousStartDate: toIsoDate(previousStart),
    previousEndDate: toIsoDate(previousEnd),
  };
}

/**
 * % thay đổi giữa hai kỳ. Trả `null` khi kỳ trước bằng 0 — lúc đó
 * "tăng vô hạn %" không nói lên điều gì, UI sẽ hiện dấu — thay vì con số ảo.
 */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

/** `20260804` (GA4 trả dimension `date` không có dấu gạch) → `2026-08-04`. */
export function normalizeGaDate(value: string): string {
  const compact = value.trim();
  if (/^\d{8}$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  }
  return compact;
}

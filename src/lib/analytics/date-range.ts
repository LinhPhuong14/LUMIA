export const RANGE_KEYS = ["7d", "28d", "90d"] as const;

export type RangeKey = (typeof RANGE_KEYS)[number];

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
  "7d": "7 ngày",
  "28d": "28 ngày",
  "90d": "90 ngày",
};

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "28d": 28,
  "90d": 90,
};

export function isRangeKey(value: unknown): value is RangeKey {
  return typeof value === "string" && (RANGE_KEYS as readonly string[]).includes(value);
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
 * Khoảng ngày kết thúc ở **hôm qua**: GA4 chưa chốt dữ liệu của hôm nay,
 * còn Search Console trễ tới 2-3 ngày, nên lấy tới hôm nay chỉ tạo ra
 * một cột cuối luôn tụt xuống 0 và làm sai % so sánh.
 */
export function resolveDateRange(key: RangeKey, today: Date = new Date()): DateRange {
  const days = RANGE_DAYS[key];
  const end = shiftDays(today, -1);
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

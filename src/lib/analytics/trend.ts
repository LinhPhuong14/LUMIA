import type { RangeKey } from "@/lib/analytics/date-range";

export type TrendDatum = {
  date: string;
  primary: number;
  secondary: number;
};

export type TrendBucket = {
  /** Ngày đầu của nhóm — dùng làm nhãn trục X. */
  date: string;
  primary: number;
  secondary: number;
  /** Số ngày thực tế gộp vào nhóm này. */
  days: number;
};

const DAYS_PER_WEEK = 7;

/**
 * Kỳ 90 ngày vẽ từng ngày thì ra 90 cột chen chúc, không đọc được nhãn nào.
 * Gom theo tuần còn 13 điểm — vừa đủ thưa để đọc, vừa đủ dày để thấy xu hướng.
 */
export function shouldBucketByWeek(range: RangeKey): boolean {
  return range === "90d";
}

/**
 * Gom các ngày thành nhóm 7 ngày và trả về **trung bình mỗi ngày** trong nhóm,
 * không phải tổng.
 *
 * Dùng tổng thì trục Y của kỳ 90 ngày cao gấp 7 lần kỳ 7 ngày, đổi tab một cái
 * là tưởng lưu lượng tăng vọt trong khi thực tế không đổi. Lấy trung bình giữ
 * cho cả ba kỳ cùng một thang đo, so sánh bằng mắt được ngay.
 *
 * Nhóm cuối có thể ngắn hơn 7 ngày; chia theo số ngày thực tế nên nó không bị
 * kéo tụt xuống một cách giả tạo.
 */
export function bucketByWeek(points: TrendDatum[]): TrendBucket[] {
  const buckets: TrendBucket[] = [];

  for (let index = 0; index < points.length; index += DAYS_PER_WEEK) {
    const chunk = points.slice(index, index + DAYS_PER_WEEK);
    const days = chunk.length;

    buckets.push({
      date: chunk[0].date,
      primary: Math.round(chunk.reduce((sum, point) => sum + point.primary, 0) / days),
      secondary: Math.round(chunk.reduce((sum, point) => sum + point.secondary, 0) / days),
      days,
    });
  }

  return buckets;
}

/** Gom theo tuần khi kỳ báo cáo dài, còn lại giữ nguyên từng ngày. */
export function prepareTrend(points: TrendDatum[], range: RangeKey): TrendBucket[] {
  if (shouldBucketByWeek(range)) {
    return bucketByWeek(points);
  }
  return points.map((point) => ({ ...point, days: 1 }));
}

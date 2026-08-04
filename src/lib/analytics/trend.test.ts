import { describe, expect, it } from "vitest";

import { bucketByWeek, prepareTrend, shouldBucketByWeek, type TrendDatum } from "@/lib/analytics/trend";

function series(count: number, value = 10): TrendDatum[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(2026, 4, 6 + index));
    return { date: date.toISOString().slice(0, 10), primary: value, secondary: value * 2 };
  });
}

describe("shouldBucketByWeek", () => {
  it("chỉ gom nhóm ở kỳ 90 ngày", () => {
    expect(shouldBucketByWeek("7d")).toBe(false);
    expect(shouldBucketByWeek("28d")).toBe(false);
    expect(shouldBucketByWeek("90d")).toBe(true);
  });
});

describe("prepareTrend", () => {
  it("kỳ 7 ngày giữ đúng 7 điểm", () => {
    expect(prepareTrend(series(7), "7d")).toHaveLength(7);
  });

  it("kỳ 28 ngày giữ đúng 28 điểm", () => {
    expect(prepareTrend(series(28), "28d")).toHaveLength(28);
  });

  it("kỳ 90 ngày gom còn 13 điểm theo tuần", () => {
    expect(prepareTrend(series(90), "90d")).toHaveLength(13);
  });
});

describe("bucketByWeek", () => {
  it("trả trung bình mỗi ngày, không phải tổng — để trục Y so sánh được giữa các kỳ", () => {
    const [first] = bucketByWeek(series(7, 10));
    expect(first.primary).toBe(10);
    expect(first.secondary).toBe(20);
  });

  it("nhãn là ngày đầu của tuần", () => {
    const buckets = bucketByWeek(series(14));
    expect(buckets[0].date).toBe("2026-05-06");
    expect(buckets[1].date).toBe("2026-05-13");
  });

  it("nhóm cuối ngắn hơn 7 ngày vẫn chia theo số ngày thực tế", () => {
    const points = [...series(7, 10), ...series(2, 40).map((p, i) => ({ ...p, date: `2026-05-1${3 + i}` }))];
    const buckets = bucketByWeek(points);
    expect(buckets).toHaveLength(2);
    expect(buckets[1].days).toBe(2);
    // Trung bình của 40 và 40 là 40 — không bị chia cho 7 rồi tụt xuống ~11.
    expect(buckets[1].primary).toBe(40);
  });

  it("giữ nguyên thang đo: chuỗi phẳng thì mọi tuần bằng nhau", () => {
    const buckets = bucketByWeek(series(90, 33));
    for (const bucket of buckets) {
      expect(bucket.primary).toBe(33);
    }
  });

  it("chuỗi rỗng không làm vỡ", () => {
    expect(bucketByWeek([])).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";

import type { SnapshotRow } from "@/lib/analytics/snapshot";
import { selectHistorical, spliceGaSummary, spliceTrend } from "@/lib/analytics/splice";
import type { GaSummary } from "@/lib/analytics/types";

function row(date: string, overrides: Partial<SnapshotRow> = {}): SnapshotRow {
  return {
    date,
    source: "demo",
    users: 30,
    newUsers: 20,
    sessions: 40,
    pageViews: 120,
    engagementRate: 0.6,
    avgSessionSeconds: 120,
    clicks: 5,
    impressions: 200,
    ...overrides,
  };
}

describe("spliceTrend", () => {
  it("ghép lịch sử với số thật và sắp theo ngày", () => {
    const merged = spliceTrend(
      [row("2026-06-02"), row("2026-06-01")],
      [{ date: "2026-06-03", users: 11, sessions: 14 }],
    );

    expect(merged.map((point) => point.date)).toEqual([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
    ]);
  });

  it("ngày trùng thì số thật thắng, không cộng dồn hai nguồn", () => {
    const merged = spliceTrend(
      [row("2026-06-01", { users: 30, sessions: 40 })],
      [{ date: "2026-06-01", users: 7, sessions: 9 }],
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].users).toBe(7);
    expect(merged[0].sessions).toBe(9);
  });

  it("không có lịch sử thì trả đúng chuỗi thật", () => {
    const real = [{ date: "2026-06-03", users: 11, sessions: 14 }];
    expect(spliceTrend([], real)).toEqual(real);
  });
});

describe("spliceGaSummary", () => {
  const real: GaSummary = {
    users: 100,
    newUsers: 60,
    sessions: 100,
    pageViews: 300,
    eventCount: 800,
    engagementRate: 0.8,
    avgSessionSeconds: 200,
  };

  it("cộng đúng các chỉ số cộng được", () => {
    const merged = spliceGaSummary([row("2026-06-01"), row("2026-06-02")], real);

    expect(merged.users).toBe(160);
    expect(merged.newUsers).toBe(100);
    expect(merged.sessions).toBe(180);
    expect(merged.pageViews).toBe(540);
    // Lịch sử (snapshot không có eventCount) ước lượng: 240 lượt xem + 80*2,4 ≈
    // 432, cộng 800 event thật = 1232.
    expect(merged.eventCount).toBe(240 + Math.round(80 * 2.4) + 800);
  });

  it("tỉ lệ tương tác lấy trọng số theo phiên, không phải trung bình cộng", () => {
    // 80 phiên ở 0,6 + 100 phiên ở 0,8 → (48 + 80) / 180 = 0,7111
    const merged = spliceGaSummary([row("2026-06-01"), row("2026-06-02")], real);
    expect(merged.engagementRate).toBeCloseTo(0.7111, 4);
    // Trung bình cộng sẽ ra 0,7 — sai, và sai càng nhiều khi hai đoạn lệch độ dài.
    expect(merged.engagementRate).not.toBeCloseTo(0.7, 4);
  });

  it("đoạn lịch sử dài không bị vài ngày thật đè bẹp", () => {
    const long = Array.from({ length: 60 }, (_, i) =>
      row(`2026-06-${String((i % 28) + 1).padStart(2, "0")}`, { engagementRate: 0.5 }),
    );
    const merged = spliceGaSummary(long, { ...real, sessions: 10, engagementRate: 0.9 });
    // 2.400 phiên ở 0,5 áp đảo 10 phiên ở 0,9 → phải sát 0,5.
    expect(merged.engagementRate).toBeLessThan(0.52);
  });

  it("không có lịch sử thì trả nguyên bản thật", () => {
    expect(spliceGaSummary([], real)).toEqual(real);
  });
});

describe("selectHistorical", () => {
  const rows = [row("2026-05-30"), row("2026-06-01"), row("2026-06-05")];

  it("chỉ lấy ngày nằm trong kỳ VÀ trước mốc gắn đo", () => {
    const picked = selectHistorical(rows, "2026-05-31", "2026-06-10", "2026-06-03");
    expect(picked.map((r) => r.date)).toEqual(["2026-06-01"]);
  });

  it("chưa đặt mốc thì không dùng lịch sử nào", () => {
    expect(selectHistorical(rows, "2026-01-01", "2026-12-31", null)).toEqual([]);
  });

  it("mốc nằm trước toàn bộ lịch sử thì không lấy gì", () => {
    expect(selectHistorical(rows, "2026-01-01", "2026-12-31", "2026-05-01")).toEqual([]);
  });
});

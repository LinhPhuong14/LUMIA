import { describe, expect, it } from "vitest";

import type { DateRange } from "@/lib/analytics/date-range";
import { buildSampleGaReport, buildSampleGscReport } from "@/lib/analytics/sample-data";

// Kỳ chiến dịch 10/8 → 23/8 (14 ngày), kỳ trước liền kề 14 ngày.
const CAMPAIGN: DateRange = {
  key: "28d",
  days: 14,
  startDate: "2026-08-10",
  endDate: "2026-08-23",
  previousStartDate: "2026-07-27",
  previousEndDate: "2026-08-09",
};

describe("buildSampleGaReport", () => {
  const report = buildSampleGaReport(CAMPAIGN);

  it("tất định — gọi lại ra kết quả y hệt", () => {
    expect(buildSampleGaReport(CAMPAIGN)).toEqual(report);
  });

  it("chạm mốc ~1.400 users cho kỳ chiến dịch", () => {
    expect(report.summary.users).toBeGreaterThanOrEqual(1300);
    expect(report.summary.users).toBeLessThanOrEqual(1500);
  });

  it("tổng phiên ~1.800-2.000, lượt xem ~6.840", () => {
    expect(report.summary.sessions).toBeGreaterThanOrEqual(1750);
    expect(report.summary.sessions).toBeLessThanOrEqual(2100);
    expect(report.summary.pageViews).toBeGreaterThanOrEqual(6300);
    expect(report.summary.pageViews).toBeLessThanOrEqual(7400);
  });

  it("engagement 58-63%, thời lượng 135-165s", () => {
    expect(report.summary.engagementRate).toBeGreaterThanOrEqual(0.58);
    expect(report.summary.engagementRate).toBeLessThanOrEqual(0.63);
    expect(report.summary.avgSessionSeconds).toBeGreaterThanOrEqual(135);
    expect(report.summary.avgSessionSeconds).toBeLessThanOrEqual(165);
  });

  it("trend đủ 14 ngày, tăng dần (sóng) và tổng trend = KPI users", () => {
    expect(report.trend).toHaveLength(14);
    expect(report.daily).toHaveLength(14);
    const trendUsers = report.trend.reduce((s, p) => s + p.users, 0);
    expect(report.summary.users).toBe(trendUsers);
    // Ngày cuối phải cao hơn ngày đầu (đường đi lên).
    expect(report.trend[13].users).toBeGreaterThan(report.trend[0].users);
  });

  it("kỳ này cao hơn kỳ trước (tăng trưởng)", () => {
    expect(report.summary.users).toBeGreaterThan(report.previousSummary.users);
  });

  it("nguồn 50/35/15, không có Unassigned", () => {
    const total = report.channels.reduce((s, r) => s + r.value, 0);
    const direct = report.channels.find((r) => r.label === "Direct")!.value;
    expect(report.channels.some((r) => r.label === "Unassigned")).toBe(false);
    expect(direct / total).toBeGreaterThan(0.45);
    expect(direct / total).toBeLessThan(0.55);
    expect(report.channels.map((r) => r.label).sort()).toEqual(
      ["Direct", "Organic Search", "Organic Social"],
    );
  });

  it("thiết bị 80/20 Mobile/Desktop", () => {
    const total = report.devices.reduce((s, r) => s + r.value, 0);
    const mobile = report.devices.find((r) => r.label === "mobile")!.value;
    expect(mobile / total).toBeGreaterThan(0.75);
    expect(mobile / total).toBeLessThan(0.85);
  });

  it("thị trường chính là Việt Nam, và tổng bảng quốc gia = tổng users", () => {
    expect(report.countries[0].label).toBe("Vietnam");
    const countryTotal = report.countries.reduce((s, r) => s + r.value, 0);
    expect(countryTotal).toBe(report.summary.users);
    const vietnam = report.countries.find((r) => r.label === "Vietnam")!.value;
    expect(vietnam / report.summary.users).toBeGreaterThan(0.95);
  });

  it("quan hệ chỉ số hợp lý: phiên ≥ người, lượt xem ≥ phiên, sự kiện ≥ lượt xem", () => {
    expect(report.summary.sessions).toBeGreaterThan(report.summary.users);
    expect(report.summary.pageViews).toBeGreaterThan(report.summary.sessions);
    expect(report.summary.eventCount).toBeGreaterThan(report.summary.pageViews);
    expect(report.summary.newUsers).toBeLessThanOrEqual(report.summary.users);
  });
});

describe("buildSampleGscReport", () => {
  const report = buildSampleGscReport(CAMPAIGN, "sc-domain:lumia.com.vn");

  it("chạm mốc ~185 click, ~2.850 hiển thị, vị trí ~9,8", () => {
    expect(report.summary.clicks).toBeGreaterThanOrEqual(175);
    expect(report.summary.clicks).toBeLessThanOrEqual(195);
    expect(report.summary.impressions).toBeGreaterThanOrEqual(2750);
    expect(report.summary.impressions).toBeLessThanOrEqual(2950);
    expect(report.summary.position).toBeCloseTo(9.8, 1);
  });

  it("CTR = click / hiển thị (nhất quán)", () => {
    expect(report.summary.ctr).toBeCloseTo(report.summary.clicks / report.summary.impressions, 5);
  });

  it("trend đủ ngày; top query xếp giảm dần theo click, click ≤ hiển thị", () => {
    expect(report.trend).toHaveLength(14);
    const clicks = report.topQueries.map((r) => r.clicks);
    expect([...clicks].sort((a, b) => b - a)).toEqual(clicks);
    expect(report.topQueries.every((r) => r.clicks <= r.impressions)).toBe(true);
  });
});

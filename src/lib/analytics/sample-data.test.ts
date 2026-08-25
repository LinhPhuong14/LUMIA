import { describe, expect, it } from "vitest";

import type { DateRange } from "@/lib/analytics/date-range";
import { buildSampleGaReport, buildSampleGscReport } from "@/lib/analytics/sample-data";

// Trọn kỳ kịch bản 3 tháng: 28/5 → 5/9 (mốc ~1.900 users), kỳ trước liền kề.
const FULL: DateRange = {
  key: "90d",
  days: 100,
  startDate: "2026-05-28",
  endDate: "2026-09-05",
  previousStartDate: "2026-02-17",
  previousEndDate: "2026-05-27",
};

// Kỳ 90 ngày tính TỚI HÔM NAY (25/8) — cái người dùng thực sự thấy trên dashboard.
const TO_TODAY: DateRange = {
  key: "90d",
  days: 90,
  startDate: "2026-05-27",
  endDate: "2026-08-25",
  previousStartDate: "2026-02-26",
  previousEndDate: "2026-05-26",
};

describe("buildSampleGaReport", () => {
  const report = buildSampleGaReport(FULL);

  it("tất định — gọi lại ra kết quả y hệt", () => {
    expect(buildSampleGaReport(FULL)).toEqual(report);
  });

  it("trọn kỳ 3 tháng chạm mốc ~1.900 users", () => {
    expect(report.summary.users).toBeGreaterThanOrEqual(1850);
    expect(report.summary.users).toBeLessThanOrEqual(1950);
  });

  it("KPI users KHÔNG phình khi range rộng bất thường (neo theo số duy nhất)", () => {
    // Users của một kỳ là số DUY NHẤT (loại trùng) nên không cộng dồn theo ngày:
    // kéo rộng ra trước ngày mở vẫn quanh mốc, chỉ nhỉnh nhẹ nhờ chặn trần.
    const superWide = buildSampleGaReport({
      key: "90d",
      days: 180,
      startDate: "2026-03-09",
      endDate: "2026-09-05",
      previousStartDate: "2025-09-10",
      previousEndDate: "2026-03-08",
    });
    expect(superWide.summary.users).toBeLessThanOrEqual(1960);
    expect(superWide.summary.users).toBeGreaterThanOrEqual(1850);
  });

  it("tính tới hôm nay (25/8) là số 'đang chạy' — thấp hơn mốc 5/9 nhưng đã lớn", () => {
    const now = buildSampleGaReport(TO_TODAY).summary;
    expect(now.users).toBeGreaterThan(1400);
    expect(now.users).toBeLessThan(report.summary.users); // chưa tới 5/9 nên < 1.900
  });

  it("các chỉ số phụ khớp theo users (phiên ~1,6×; lượt xem ~3,4×phiên)", () => {
    const s = report.summary;
    expect(s.sessions / s.users).toBeGreaterThan(1.45);
    expect(s.sessions / s.users).toBeLessThan(1.75);
    expect(s.pageViews / s.sessions).toBeGreaterThan(3.1);
    expect(s.pageViews / s.sessions).toBeLessThan(3.7);
    expect(s.newUsers).toBeLessThanOrEqual(s.users);
    expect(s.eventCount).toBeGreaterThan(s.pageViews);
  });

  it("engagement 58-63%, thời lượng 135-165s", () => {
    expect(report.summary.engagementRate).toBeGreaterThanOrEqual(0.58);
    expect(report.summary.engagementRate).toBeLessThanOrEqual(0.63);
    expect(report.summary.avgSessionSeconds).toBeGreaterThanOrEqual(135);
    expect(report.summary.avgSessionSeconds).toBeLessThanOrEqual(165);
  });

  it("trend phủ đủ ngày và ĐI LÊN suốt 3 tháng (ngày cuối > ngày đầu)", () => {
    expect(report.trend.length).toBe(report.daily.length);
    expect(report.trend.length).toBeGreaterThan(95); // ~101 ngày
    expect(report.trend[report.trend.length - 1].users).toBeGreaterThan(report.trend[0].users);
    // Active theo ngày cộng dồn > số DUY NHẤT (người quay lại) — đúng GA4.
    const trendUsers = report.trend.reduce((s, p) => s + p.users, 0);
    expect(trendUsers).toBeGreaterThan(report.summary.users);
  });

  it("kỳ này cao hơn kỳ trước (site mới mở → tăng trưởng mạnh)", () => {
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

  it("từ 6/9 nối GA thật khi truyền realDaily; tới 5/9 vẫn là sample", () => {
    const range: DateRange = {
      key: "28d",
      days: 14,
      startDate: "2026-08-30",
      endDate: "2026-09-12",
      previousStartDate: "2026-08-16",
      previousEndDate: "2026-08-29",
    };
    const realDaily = [
      { date: "2026-09-06", users: 30, newUsers: 12, sessions: 48, pageViews: 150, eventCount: 320, engagementRate: 0.6, avgSessionSeconds: 150 },
      { date: "2026-09-07", users: 33, newUsers: 13, sessions: 52, pageViews: 165, eventCount: 350, engagementRate: 0.61, avgSessionSeconds: 152 },
    ];
    const out = buildSampleGaReport(range, realDaily);
    const at = (d: string) => out.daily.find((p) => p.date === d)!;
    expect(at("2026-09-05").users).toBeGreaterThan(30); // sample kỳ 3 tháng
    expect(at("2026-09-06").users).toBe(30); // GA thật
    expect(at("2026-09-07").users).toBe(33); // GA thật
    expect(at("2026-09-08").users).toBe(0); // thật thiếu ngày = 0 (chưa có traffic)
  });
});

describe("buildSampleGscReport", () => {
  const report = buildSampleGscReport(FULL, "sc-domain:lumia.com.vn");

  it("trọn kỳ ~420 click, ~8.400 hiển thị, vị trí ~9,5", () => {
    expect(report.summary.clicks).toBeGreaterThanOrEqual(400);
    expect(report.summary.clicks).toBeLessThanOrEqual(440);
    expect(report.summary.impressions).toBeGreaterThanOrEqual(8000);
    expect(report.summary.impressions).toBeLessThanOrEqual(8800);
    expect(report.summary.position).toBeCloseTo(9.5, 1);
  });

  it("CTR = click / hiển thị và đúng ~5%", () => {
    expect(report.summary.ctr).toBeCloseTo(report.summary.clicks / report.summary.impressions, 5);
    expect(report.summary.ctr).toBeGreaterThan(0.048);
    expect(report.summary.ctr).toBeLessThan(0.052);
  });

  it("CTR giữ ~5% ở mọi độ dài kỳ (không lệch khi đổi range)", () => {
    const now = buildSampleGscReport(TO_TODAY, "sc-domain:lumia.com.vn").summary;
    expect(now.ctr).toBeGreaterThan(0.048);
    expect(now.ctr).toBeLessThan(0.052);
  });

  it("trend đủ ngày; top query xếp giảm dần theo click, click ≤ hiển thị", () => {
    expect(report.trend.length).toBeGreaterThan(95);
    const clicks = report.topQueries.map((r) => r.clicks);
    expect([...clicks].sort((a, b) => b - a)).toEqual(clicks);
    expect(report.topQueries.every((r) => r.clicks <= r.impressions)).toBe(true);
  });
});

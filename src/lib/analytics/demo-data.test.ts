import { describe, expect, it } from "vitest";

import { resolveDateRange } from "@/lib/analytics/date-range";
import {
  baselineDailyUsers,
  buildDemoGaReport,
  buildDemoGscReport,
  DEMO_DEFAULT_PEAK_DAILY_USERS,
  type DemoCalibration,
} from "@/lib/analytics/demo-data";

const TODAY = new Date("2026-08-04T09:00:00Z");
// Site mở bán 60 ngày trước ngày cuối kỳ báo cáo (2026-08-03).
const CALIBRATION: DemoCalibration = {
  launchDate: new Date("2026-06-04T00:00:00Z"),
  peakDailyUsers: DEMO_DEFAULT_PEAK_DAILY_USERS,
};

const SITE_URL = "https://www.lumia.com.vn/";

describe("baselineDailyUsers", () => {
  it("chưa mở bán thì chưa có ai", () => {
    expect(baselineDailyUsers(-1, 110)).toBe(0);
  });

  it("có spike ra mắt rồi hụt xuống trong hai tuần đầu", () => {
    const launch = baselineDailyUsers(0, 110);
    const trough = baselineDailyUsers(10, 110);
    expect(launch).toBeGreaterThan(trough);
  });

  it("tăng đều trở lại và tiệm cận trần đã đặt", () => {
    expect(baselineDailyUsers(60, 110)).toBeGreaterThan(baselineDailyUsers(20, 110));
    expect(baselineDailyUsers(400, 110)).toBeLessThanOrEqual(110);
    expect(baselineDailyUsers(400, 110)).toBeGreaterThan(105);
  });
});

describe("buildDemoGaReport", () => {
  const range = resolveDateRange("28d", TODAY);
  const report = buildDemoGaReport(range, CALIBRATION);

  it("tất định — gọi lại cho kết quả y hệt", () => {
    expect(buildDemoGaReport(range, CALIBRATION)).toEqual(report);
  });

  it("một ngày cụ thể có cùng số liệu dù xem ở kỳ 7 hay 90 ngày", () => {
    const short = buildDemoGaReport(resolveDateRange("7d", TODAY), CALIBRATION);
    const long = buildDemoGaReport(resolveDateRange("90d", TODAY), CALIBRATION);

    for (const point of short.trend) {
      expect(long.trend.find((p) => p.date === point.date)).toEqual(point);
    }
  });

  it("trend đủ số ngày của kỳ và tổng KPI khớp với trend", () => {
    expect(report.trend).toHaveLength(range.days);
    const trendUsers = report.trend.reduce((sum, point) => sum + point.users, 0);
    expect(report.summary.users).toBe(trendUsers);
  });

  it("site mới nên kỳ này phải nhỉnh hơn kỳ trước", () => {
    expect(report.summary.users).toBeGreaterThan(report.previousSummary.users);
  });

  it("quan hệ giữa các chỉ số hợp lý: phiên ≥ người dùng, lượt xem ≥ phiên", () => {
    expect(report.summary.sessions).toBeGreaterThan(report.summary.users);
    expect(report.summary.pageViews).toBeGreaterThan(report.summary.sessions);
    expect(report.summary.newUsers).toBeLessThan(report.summary.users);
    expect(report.summary.engagementRate).toBeGreaterThan(0);
    expect(report.summary.engagementRate).toBeLessThan(1);
  });

  it("mọi bảng xếp hạng đều giảm dần và không có giá trị 0", () => {
    for (const rows of [report.channels, report.devices, report.countries]) {
      expect(rows.length).toBeGreaterThan(0);
      const values = rows.map((row) => row.value);
      expect(values.every((value) => value > 0)).toBe(true);
      expect([...values].sort((a, b) => b - a)).toEqual(values);
    }

    const pageViews = report.topPages.map((page) => page.views);
    expect(pageViews.every((value) => value > 0)).toBe(true);
    expect([...pageViews].sort((a, b) => b - a)).toEqual(pageViews);
  });

  it("thị trường chính là Việt Nam", () => {
    expect(report.countries[0]?.label).toBe("Vietnam");
  });
});

describe("buildDemoGscReport", () => {
  const range = resolveDateRange("90d", TODAY);
  const report = buildDemoGscReport(range, CALIBRATION, SITE_URL);

  it("tất định", () => {
    expect(buildDemoGscReport(range, CALIBRATION, SITE_URL)).toEqual(report);
  });

  it("hai tuần đầu sau khi mở bán chưa có impression vì Google chưa index", () => {
    const early = report.trend.filter((point) => point.date < "2026-06-18");
    expect(early.length).toBeGreaterThan(0);
    expect(early.every((point) => point.impressions === 0)).toBe(true);
  });

  it("CTR và vị trí nằm trong khoảng thực tế của site mới", () => {
    expect(report.summary.ctr).toBeGreaterThan(0.005);
    expect(report.summary.ctr).toBeLessThan(0.06);
    expect(report.summary.position).toBeGreaterThan(10);
    expect(report.summary.position).toBeLessThan(45);
  });

  it("vị trí trung bình có trọng số theo impression, không bị ngày chưa index kéo về 0", () => {
    const activeDays = report.trend.filter((point) => point.impressions > 0);
    expect(activeDays.length).toBeLessThan(report.trend.length);
    expect(report.summary.position).toBeGreaterThan(0);
  });

  it("click không bao giờ vượt impression", () => {
    expect(report.summary.clicks).toBeLessThan(report.summary.impressions);
    for (const point of report.trend) {
      expect(point.clicks).toBeLessThanOrEqual(point.impressions);
    }
  });

  it("truy vấn thương hiệu đứng đầu và có CTR cao nhất", () => {
    expect(report.topQueries[0]?.label).toBe("lumia");
    const maxCtr = Math.max(...report.topQueries.map((row) => row.ctr));
    expect(report.topQueries[0]?.ctr).toBe(maxCtr);
  });

  it("bảng từ khoá và trang xếp giảm dần theo click", () => {
    for (const rows of [report.topQueries, report.topPages]) {
      const clicks = rows.map((row) => row.clicks);
      expect([...clicks].sort((a, b) => b - a)).toEqual(clicks);
      expect(rows.every((row) => row.clicks <= row.impressions)).toBe(true);
    }
  });

  it("top trang trả về URL tuyệt đối của đúng site", () => {
    for (const row of report.topPages) {
      expect(row.label.startsWith("https://www.lumia.com.vn/")).toBe(true);
    }
  });
});

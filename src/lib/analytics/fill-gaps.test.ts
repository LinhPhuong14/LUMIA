import { describe, expect, it } from "vitest";

import { resolveDateRange } from "@/lib/analytics/date-range";
import { buildDemoGaReport, buildDemoGscReport } from "@/lib/analytics/demo-data";
import { fillGaGaps, fillGscGaps, isGscEmpty } from "@/lib/analytics/fill-gaps";
import type { GaReport, GscReport } from "@/lib/analytics/types";

const range = resolveDateRange("28d");
const calibration = { launchDate: new Date("2026-06-04T00:00:00Z"), peakDailyUsers: 30 };
const demoGa = buildDemoGaReport(range, calibration);
const demoGsc = buildDemoGscReport(range, calibration, "sc-domain:lumia.com.vn");

/** GA4 mới gắn tag: tổng đã có (nhờ nối lịch sử) nhưng chưa chia nhóm được. */
function emptyBreakdowns(summary: Partial<GaReport["summary"]> = {}): GaReport {
  return {
    summary: {
      users: 664,
      newUsers: 474,
      sessions: 845,
      pageViews: 2486,
      eventCount: 4514,
      engagementRate: 0.612,
      avgSessionSeconds: 130,
      ...summary,
    },
    previousSummary: demoGa.previousSummary,
    trend: demoGa.trend,
    daily: demoGa.daily,
    topPages: [],
    channels: [],
    devices: [],
    countries: [],
  };
}

describe("fillGaGaps", () => {
  it("lấp cả bốn bảng khi API thật chưa chia nhóm được", () => {
    const { report, filled } = fillGaGaps(emptyBreakdowns(), demoGa);

    expect(filled).toEqual(["topPages", "channels", "devices", "countries"]);
    expect(report.topPages.length).toBeGreaterThan(0);
    expect(report.channels.length).toBeGreaterThan(0);
    expect(report.devices.length).toBeGreaterThan(0);
    expect(report.countries.length).toBeGreaterThan(0);
  });

  it("không đụng vào bảng đã có dòng thật", () => {
    const real = emptyBreakdowns();
    real.devices = [{ label: "mobile", value: 3 }];

    const { report, filled } = fillGaGaps(real, demoGa);

    expect(filled).not.toContain("devices");
    expect(report.devices).toEqual([{ label: "mobile", value: 3 }]);
  });

  it("số lấp co theo tổng đang hiển thị, không phải quy mô của bộ sinh", () => {
    const real = emptyBreakdowns();
    const { report } = fillGaGaps(real, demoGa);

    // Thiết bị chia nhỏ số người dùng, nên cộng lại phải xấp xỉ ô "Người dùng".
    const deviceTotal = report.devices.reduce((sum, row) => sum + row.value, 0);
    expect(deviceTotal).toBeGreaterThan(real.summary.users * 0.9);
    expect(deviceTotal).toBeLessThan(real.summary.users * 1.1);

    // Kênh chia nhỏ số phiên.
    const channelTotal = report.channels.reduce((sum, row) => sum + row.value, 0);
    expect(channelTotal).toBeGreaterThan(real.summary.sessions * 0.9);
    expect(channelTotal).toBeLessThan(real.summary.sessions * 1.1);

    // Top trang không bao giờ vượt tổng lượt xem — GA4 chỉ trả top 10.
    const viewTotal = report.topPages.reduce((sum, row) => sum + row.views, 0);
    expect(viewTotal).toBeLessThanOrEqual(real.summary.pageViews);
  });

  it("bảng xếp hạng luôn giảm dần sau khi lấp", () => {
    const { report } = fillGaGaps(emptyBreakdowns(), demoGa);

    for (const rows of [report.channels, report.devices, report.countries]) {
      const values = rows.map((row) => row.value);
      expect(values).toEqual([...values].sort((a, b) => b - a));
    }
    const views = report.topPages.map((row) => row.views);
    expect(views).toEqual([...views].sort((a, b) => b - a));
  });

  it("tổng bằng 0 thì không có gì để co theo — bỏ qua, không chia cho 0", () => {
    const zero = emptyBreakdowns({ users: 0, sessions: 0, pageViews: 0 });
    const { report, filled } = fillGaGaps(zero, demoGa);

    expect(filled).toEqual([]);
    expect(report.devices).toEqual([]);
  });
});

describe("isGscEmpty", () => {
  it("chưa có impression lẫn click = property đã verify nhưng chưa chạy", () => {
    const empty: GscReport = {
      ...demoGsc,
      summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    };
    expect(isGscEmpty(empty)).toBe(true);
  });

  it("chỉ cần một impression thật là giữ nguyên số thật", () => {
    const barelyLive: GscReport = {
      ...demoGsc,
      summary: { clicks: 0, impressions: 1, ctr: 0, position: 42 },
    };
    expect(isGscEmpty(barelyLive)).toBe(false);
  });
});

describe("fillGscGaps", () => {
  it("thay số liệu nhưng giữ nguyên property đang gọi", () => {
    const real: GscReport = {
      siteUrl: "https://www.lumia.com.vn/",
      summary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      previousSummary: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      trend: [],
      topQueries: [],
      topPages: [],
    };

    const filled = fillGscGaps(real, demoGsc);

    expect(filled.siteUrl).toBe("https://www.lumia.com.vn/");
    expect(filled.summary.impressions).toBeGreaterThan(0);
    expect(filled.topQueries.length).toBeGreaterThan(0);
    expect(filled.trend.length).toBeGreaterThan(0);
  });
});

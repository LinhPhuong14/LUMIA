import { describe, expect, it } from "vitest";

import {
  applyMockDates,
  buildMockDay,
  DEFAULT_MOCK_DATES,
  parseMockGaDates,
  resolveMockDates,
} from "@/lib/analytics/mock-override";
import type { GaDailyPoint, GaReport, GaSummary } from "@/lib/analytics/types";

describe("parseMockGaDates", () => {
  it("tách danh sách ngày ISO, bỏ giá trị rác", () => {
    const set = parseMockGaDates(" 2026-08-15 ,2026-08-16, rác ,2026-8-1");
    expect([...set].sort()).toEqual(["2026-08-15", "2026-08-16"]);
  });

  it("rỗng khi không cấu hình", () => {
    expect(parseMockGaDates(undefined).size).toBe(0);
    expect(parseMockGaDates("").size).toBe(0);
  });
});

describe("resolveMockDates", () => {
  it("không có env → dùng danh sách bake sẵn 14-17/8", () => {
    expect([...resolveMockDates(undefined)].sort()).toEqual([...DEFAULT_MOCK_DATES]);
    expect(resolveMockDates(undefined).has("2026-08-14")).toBe(true);
  });

  it("có env hợp lệ → ghi đè danh sách bake sẵn", () => {
    expect([...resolveMockDates("2026-09-01")]).toEqual(["2026-09-01"]);
  });
});

describe("buildMockDay", () => {
  it("bám đúng mục tiêu: 15-25 người, 1,2-1,5 phiên/người", () => {
    for (const date of [...DEFAULT_MOCK_DATES, "2026-08-01"]) {
      const day = buildMockDay(date);
      expect(day.users).toBeGreaterThanOrEqual(15);
      expect(day.users).toBeLessThanOrEqual(25);
      const perUser = day.sessions / day.users;
      expect(perUser).toBeGreaterThanOrEqual(1.2);
      expect(perUser).toBeLessThanOrEqual(1.55); // +biên làm tròn
    }
  });

  it("các field khác nhất quán với users/sessions", () => {
    const day = buildMockDay("2026-08-16");
    expect(day.newUsers).toBeLessThanOrEqual(day.users);
    expect(day.sessions).toBeGreaterThanOrEqual(day.users);
    expect(day.pageViews).toBeGreaterThanOrEqual(day.sessions);
    expect(day.eventCount).toBeGreaterThan(day.pageViews);
    expect(day.engagementRate).toBeGreaterThan(0.4);
    expect(day.engagementRate).toBeLessThan(0.7);
  });

  it("tất định — cùng ngày luôn ra cùng số", () => {
    expect(buildMockDay("2026-08-15")).toEqual(buildMockDay("2026-08-15"));
    expect(buildMockDay("2026-08-15")).not.toEqual(buildMockDay("2026-08-16"));
  });
});

function daily(date: string, over: Partial<GaDailyPoint> = {}): GaDailyPoint {
  return {
    date,
    users: 500,
    newUsers: 300,
    sessions: 700,
    pageViews: 2000,
    eventCount: 4000,
    engagementRate: 0.7,
    avgSessionSeconds: 200,
    ...over,
  };
}

function summaryFrom(points: GaDailyPoint[], uniqueUsers: number): GaSummary {
  const add = (k: keyof GaDailyPoint) => points.reduce((s, p) => s + (p[k] as number), 0);
  return {
    users: uniqueUsers,
    newUsers: add("newUsers"),
    sessions: add("sessions"),
    pageViews: add("pageViews"),
    eventCount: add("eventCount"),
    engagementRate: 0.7,
    avgSessionSeconds: 200,
  };
}

describe("applyMockDates", () => {
  const days = [daily("2026-08-15"), daily("2026-08-16"), daily("2026-08-18")];
  const report: GaReport = {
    summary: summaryFrom(days, 1200),
    previousSummary: summaryFrom(days, 1000),
    trend: days.map((p) => ({ date: p.date, users: p.users, sessions: p.sessions })),
    daily: days,
    topPages: [{ path: "/", views: 800, users: 400 }],
    channels: [{ label: "Direct", value: 900 }],
    devices: [{ label: "mobile", value: 900 }],
    countries: [{ label: "Vietnam", value: 900 }],
  };

  it("chỉ thay ngày trong danh sách, ngày 18 giữ nguyên số thật", () => {
    const out = applyMockDates(report, new Set(["2026-08-15", "2026-08-16"]));
    const d18 = out.daily.find((p) => p.date === "2026-08-18")!;
    expect(d18).toEqual(daily("2026-08-18")); // nguyên vẹn
    for (const date of ["2026-08-15", "2026-08-16"]) {
      const patched = out.daily.find((p) => p.date === date)!;
      expect(patched.users).toBeLessThanOrEqual(25);
      expect(patched.users).toBeGreaterThanOrEqual(15);
    }
  });

  it("summary additive = tổng thật trừ ngày mock cộng số mock (chính xác)", () => {
    const mock = new Set(["2026-08-15", "2026-08-16"]);
    const out = applyMockDates(report, mock);
    // sessions cộng được: bằng tổng của chuỗi đã vá.
    const expectedSessions = out.daily.reduce((s, p) => s + p.sessions, 0);
    expect(out.summary.sessions).toBe(expectedSessions);
  });

  it("không có ngày mock nào trong kỳ → trả nguyên bản", () => {
    expect(applyMockDates(report, new Set(["2026-01-01"]))).toBe(report);
    expect(applyMockDates(report, new Set())).toBe(report);
  });

  it("bảng cơ cấu co giãn theo tổng đã mock — không để KPI nhỏ mà breakdown lớn", () => {
    const out = applyMockDates(report, new Set(["2026-08-15", "2026-08-16"]));
    // Tổng đã giảm mạnh (mock nhỏ hơn số thật), nên breakdown cũng phải nhỏ lại
    // theo tỉ lệ — không còn kênh 900 phiên trong khi tổng chỉ vài trăm.
    expect(out.channels[0].value).toBeLessThan(900);
    expect(out.channels[0].value).toBeLessThanOrEqual(out.summary.sessions);
    expect(out.devices[0].value).toBeLessThanOrEqual(out.summary.users);
    expect(out.topPages[0].views).toBeLessThan(800);
    expect(out.topPages[0].users).toBeLessThanOrEqual(out.summary.users);
  });

  it("trend khớp với daily đã vá", () => {
    const out = applyMockDates(report, new Set(["2026-08-15"]));
    for (const point of out.trend) {
      const day = out.daily.find((p) => p.date === point.date)!;
      expect(point.users).toBe(day.users);
      expect(point.sessions).toBe(day.sessions);
    }
  });

  it("tất định — hai tab (Báo cáo & Vận hành) cùng range phải ra số y hệt", () => {
    // Cả hai tab gọi cùng route với cùng range; override tất định theo ngày,
    // không phụ thuộc thời điểm gọi hay tab nào, nên kết quả phải trùng khít —
    // đảm bảo các ô cùng truy xuất một giá trị không lệch nhau giữa hai tab.
    const mock = new Set(["2026-08-15", "2026-08-16", "2026-08-17"]);
    const fromReportTab = applyMockDates(report, mock);
    const fromOperationsTab = applyMockDates(report, mock);
    expect(fromOperationsTab).toEqual(fromReportTab);
    expect(fromOperationsTab.summary).toEqual(fromReportTab.summary);
    expect(fromOperationsTab.daily).toEqual(fromReportTab.daily);
  });
});

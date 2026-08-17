import { describe, expect, it } from "vitest";

import {
  normalizeGaDate,
  parseRangeKey,
  percentChange,
  RANGE_KEYS,
  resolveDateRange,
  toIsoDate,
} from "@/lib/analytics/date-range";

const TODAY = new Date("2026-08-04T09:00:00Z");

describe("resolveDateRange", () => {
  it("kết thúc ở hôm qua vì GA4/GSC chưa chốt dữ liệu hôm nay", () => {
    const range = resolveDateRange("7d", TODAY);
    expect(range.endDate).toBe("2026-08-03");
    expect(range.startDate).toBe("2026-07-28");
  });

  it("kỳ trước dài đúng bằng kỳ hiện tại và nối liền, không chồng lấn", () => {
    const range = resolveDateRange("28d", TODAY);
    expect(range.endDate).toBe("2026-08-03");
    expect(range.startDate).toBe("2026-07-07");
    expect(range.previousEndDate).toBe("2026-07-06");
    expect(range.previousStartDate).toBe("2026-06-09");
    expect(range.previousEndDate < range.startDate).toBe(true);
  });

  it("mỗi range có số ngày đúng như tên", () => {
    for (const key of RANGE_KEYS) {
      const range = resolveDateRange(key, TODAY);
      const start = new Date(`${range.startDate}T00:00:00Z`).getTime();
      const end = new Date(`${range.endDate}T00:00:00Z`).getTime();
      const days = (end - start) / 86_400_000 + 1;
      expect(days).toBe(range.days);
    }
  });

  it("xử lý đúng khi lùi qua mốc đầu tháng và đầu năm", () => {
    const range = resolveDateRange("7d", new Date("2026-01-03T00:30:00Z"));
    expect(range.endDate).toBe("2026-01-02");
    expect(range.startDate).toBe("2025-12-27");
  });

  it("key 'today' luôn là đúng ngày hôm nay, kỳ trước là hôm qua", () => {
    const range = resolveDateRange("today", TODAY);
    expect(range.days).toBe(1);
    expect(range.startDate).toBe("2026-08-04");
    expect(range.endDate).toBe("2026-08-04");
    expect(range.previousStartDate).toBe("2026-08-03");
    expect(range.previousEndDate).toBe("2026-08-03");
  });

  it("includeToday kéo mốc cuối tới hôm nay cho mọi kỳ (tab Vận hành)", () => {
    const range = resolveDateRange("7d", TODAY, true);
    expect(range.endDate).toBe("2026-08-04");
    expect(range.startDate).toBe("2026-07-29");
  });

  it("mặc định không includeToday thì vẫn kết thúc ở hôm qua (tab Báo cáo)", () => {
    expect(resolveDateRange("7d", TODAY).endDate).toBe("2026-08-03");
  });
});

describe("parseRangeKey", () => {
  it("giữ giá trị hợp lệ, còn lại trả mặc định", () => {
    expect(parseRangeKey("7d")).toBe("7d");
    expect(parseRangeKey("90d")).toBe("90d");
    expect(parseRangeKey("999d")).toBe("28d");
    expect(parseRangeKey(null)).toBe("28d");
    expect(parseRangeKey(undefined, "7d")).toBe("7d");
  });
});

describe("percentChange", () => {
  it("tính đúng cả chiều tăng và giảm", () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(100, 100)).toBe(0);
  });

  it("trả null khi kỳ trước bằng 0 — không có mốc để so", () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(0, 0)).toBeNull();
  });
});

describe("normalizeGaDate", () => {
  it("đổi định dạng compact của GA4 sang ISO", () => {
    expect(normalizeGaDate("20260804")).toBe("2026-08-04");
  });

  it("giữ nguyên giá trị đã đúng định dạng", () => {
    expect(normalizeGaDate("2026-08-04")).toBe("2026-08-04");
  });
});

describe("toIsoDate", () => {
  it("cắt đúng phần ngày theo UTC", () => {
    expect(toIsoDate(new Date("2026-08-04T23:59:59Z"))).toBe("2026-08-04");
  });
});

import { describe, expect, it } from "vitest";

import {
  ANCHOR_MIN_REAL_DAYS,
  clampScaleFactor,
  isBeforeCutover,
  resolveAnchor,
  resolveBackfillEnd,
} from "@/lib/analytics/backfill";

describe("resolveAnchor", () => {
  it("chưa đặt mốc gắn đo thì chưa neo được", () => {
    const result = resolveAnchor({ hasCutover: false, realDailyUsers: [], demoDailyUsers: [] });
    expect(result).toEqual({ ready: false, reason: "no_cutover", realDays: 0 });
  });

  it("chưa đủ số ngày thật tối thiểu thì chờ", () => {
    const result = resolveAnchor({
      hasCutover: true,
      realDailyUsers: [10, 12],
      demoDailyUsers: [30, 30],
    });
    expect(result).toEqual({ ready: false, reason: "not_enough_days", realDays: 2 });
    expect(ANCHOR_MIN_REAL_DAYS).toBe(3);
  });

  it("hệ số là tỉ lệ giữa trung bình thật và trung bình dựng lại", () => {
    const result = resolveAnchor({
      hasCutover: true,
      realDailyUsers: [10, 20, 30],
      demoDailyUsers: [40, 40, 40],
    });
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.scaleFactor).toBeCloseTo(20 / 40, 6);
      expect(result.realDailyAverage).toBe(20);
    }
  });

  it("traffic thật bằng 0 thì không neo — nhiều khả năng tag hỏng", () => {
    const result = resolveAnchor({
      hasCutover: true,
      realDailyUsers: [0, 0, 0],
      demoDailyUsers: [30, 30, 30],
    });
    expect(result).toEqual({ ready: false, reason: "no_baseline", realDays: 3 });
  });

  it("không chia cho 0 khi chuỗi dựng lại rỗng giá trị", () => {
    const result = resolveAnchor({
      hasCutover: true,
      realDailyUsers: [10, 10, 10],
      demoDailyUsers: [0, 0, 0],
    });
    expect(result.ready).toBe(false);
  });

  it("một ngày bất thường không kéo hệ số vượt trần", () => {
    const result = resolveAnchor({
      hasCutover: true,
      realDailyUsers: [10, 10, 100_000],
      demoDailyUsers: [30, 30, 30],
    });
    expect(result.ready).toBe(true);
    if (result.ready) {
      expect(result.scaleFactor).toBe(20);
    }
  });
});

describe("clampScaleFactor", () => {
  it("chặn hai đầu để một sự cố không nhân hay chia cả lịch sử", () => {
    expect(clampScaleFactor(1000)).toBe(20);
    expect(clampScaleFactor(0.0001)).toBe(0.05);
    expect(clampScaleFactor(2.5)).toBe(2.5);
  });
});

describe("resolveBackfillEnd", () => {
  it("lịch sử dựng lại kết thúc ở hôm trước ngày gắn đo, không chồng lấn", () => {
    expect(resolveBackfillEnd("2026-08-04")).toBe("2026-08-03");
  });

  it("lùi qua mốc đầu tháng đúng", () => {
    expect(resolveBackfillEnd("2026-08-01")).toBe("2026-07-31");
    expect(resolveBackfillEnd("2026-01-01")).toBe("2025-12-31");
  });

  it("giá trị sai định dạng trả null thay vì ngày rác", () => {
    expect(resolveBackfillEnd(null)).toBeNull();
    expect(resolveBackfillEnd("hôm qua")).toBeNull();
    expect(resolveBackfillEnd("04/08/2026")).toBeNull();
  });
});

describe("isBeforeCutover", () => {
  it("phân loại đúng hai phía của mốc", () => {
    expect(isBeforeCutover("2026-08-03", "2026-08-04")).toBe(true);
    expect(isBeforeCutover("2026-08-04", "2026-08-04")).toBe(false);
    expect(isBeforeCutover("2026-08-05", "2026-08-04")).toBe(false);
  });

  it("chưa đặt mốc thì không ngày nào bị coi là quá khứ", () => {
    expect(isBeforeCutover("2020-01-01", null)).toBe(false);
  });
});

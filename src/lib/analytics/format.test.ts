import { describe, expect, it } from "vitest";

import {
  formatDelta,
  formatDuration,
  formatNumber,
  formatPercent,
  formatPosition,
  shortenUrl,
} from "@/lib/analytics/format";

describe("formatNumber", () => {
  it("nhóm hàng nghìn kiểu vi-VN và làm tròn", () => {
    expect(formatNumber(1234567)).toBe("1.234.567");
    expect(formatNumber(1234.6)).toBe("1.235");
    expect(formatNumber(0)).toBe("0");
  });

  it("trả — với giá trị không hợp lệ", () => {
    expect(formatNumber(Number.NaN)).toBe("—");
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("nhận tỉ lệ 0..1 rồi đổi sang phần trăm", () => {
    expect(formatPercent(0.6543)).toBe("65,4%");
    expect(formatPercent(0)).toBe("0,0%");
    expect(formatPercent(1)).toBe("100,0%");
  });
});

describe("formatDuration", () => {
  it("đổi giây sang phút:giây", () => {
    expect(formatDuration(65)).toBe("1m 05s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(3600)).toBe("60m 00s");
  });

  it("giá trị âm hoặc 0 hiển thị 0s", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(-5)).toBe("0s");
  });
});

describe("formatPosition", () => {
  it("một chữ số thập phân, dùng dấu phẩy", () => {
    expect(formatPosition(12.34)).toBe("12,3");
  });

  it("vị trí 0 nghĩa là chưa có dữ liệu", () => {
    expect(formatPosition(0)).toBe("—");
  });
});

describe("formatDelta", () => {
  it("tăng là tốt với các chỉ số thông thường", () => {
    expect(formatDelta(12.34)).toEqual({ text: "+12,3%", tone: "up" });
    expect(formatDelta(-8)).toEqual({ text: "−8,0%", tone: "down" });
  });

  it("với vị trí SERP thì giảm mới là tốt", () => {
    expect(formatDelta(-8, true)).toEqual({ text: "−8,0%", tone: "up" });
    expect(formatDelta(8, true)).toEqual({ text: "+8,0%", tone: "down" });
  });

  it("không có mốc so sánh thì hiện —", () => {
    expect(formatDelta(null)).toEqual({ text: "—", tone: "none" });
  });

  it("thay đổi không đáng kể gom về 0%", () => {
    expect(formatDelta(0)).toEqual({ text: "0%", tone: "flat" });
    expect(formatDelta(0.01)).toEqual({ text: "0%", tone: "flat" });
  });
});

describe("shortenUrl", () => {
  it("bỏ origin của URL tuyệt đối", () => {
    expect(shortenUrl("https://www.lumia.com.vn/blog/giac-ngu")).toBe("/blog/giac-ngu");
  });

  it("giữ nguyên path tương đối do GA4 trả về", () => {
    expect(shortenUrl("/store")).toBe("/store");
  });

  it("trang chủ hiển thị /", () => {
    expect(shortenUrl("https://www.lumia.com.vn/")).toBe("/");
  });

  it("cắt bớt path quá dài", () => {
    const result = shortenUrl(`/blog/${"a".repeat(80)}`, 20);
    expect(result).toHaveLength(20);
    expect(result.endsWith("…")).toBe(true);
  });
});

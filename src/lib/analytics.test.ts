import { describe, expect, it } from "vitest";

import { buildPagePath, cleanParams, isValidGaId } from "@/lib/analytics";

describe("isValidGaId", () => {
  it("chấp nhận measurement ID GA4 hợp lệ", () => {
    expect(isValidGaId("G-ABC1234567")).toBe(true);
    expect(isValidGaId("g-abc123")).toBe(true);
  });

  it("từ chối giá trị rỗng, placeholder hoặc ID của Universal Analytics", () => {
    expect(isValidGaId(undefined)).toBe(false);
    expect(isValidGaId(null)).toBe(false);
    expect(isValidGaId("")).toBe(false);
    expect(isValidGaId("UA-123456-1")).toBe(false);
    expect(isValidGaId("G-XXX")).toBe(false);
  });
});

describe("buildPagePath", () => {
  it("giữ nguyên path khi không có query", () => {
    expect(buildPagePath("/store")).toBe("/store");
    expect(buildPagePath("/")).toBe("/");
  });

  it("mặc định về / khi pathname rỗng", () => {
    expect(buildPagePath(null)).toBe("/");
    expect(buildPagePath("")).toBe("/");
  });

  it("thêm dấu / đứng đầu nếu thiếu", () => {
    expect(buildPagePath("blog")).toBe("/blog");
  });

  it("nối query string, chấp nhận cả dạng có và không có dấu ?", () => {
    expect(buildPagePath("/blog", "?tag=sleep")).toBe("/blog?tag=sleep");
    expect(buildPagePath("/blog", "tag=sleep")).toBe("/blog?tag=sleep");
    expect(buildPagePath("/blog", new URLSearchParams({ tag: "sleep" }))).toBe("/blog?tag=sleep");
  });

  it("bỏ qua query rỗng", () => {
    expect(buildPagePath("/blog", "")).toBe("/blog");
    expect(buildPagePath("/blog", new URLSearchParams())).toBe("/blog");
  });
});

describe("cleanParams", () => {
  it("loại bỏ undefined và null, giữ lại 0 và false", () => {
    expect(cleanParams({ a: 0, b: false, c: undefined, d: null, e: "x" })).toEqual({
      a: 0,
      b: false,
      e: "x",
    });
  });
});

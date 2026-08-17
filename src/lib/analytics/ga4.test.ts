import { describe, expect, it } from "vitest";

import { normalizePropertyId } from "@/lib/analytics/ga4";

describe("normalizePropertyId", () => {
  it("chấp nhận cả số trần lẫn dạng properties/…", () => {
    expect(normalizePropertyId("123456789")).toBe("123456789");
    expect(normalizePropertyId("properties/123456789")).toBe("123456789");
  });

  it("trả null cho giá trị không phải property id", () => {
    expect(normalizePropertyId("G-ABCDEFG")).toBeNull();
    expect(normalizePropertyId(undefined)).toBeNull();
    expect(normalizePropertyId("")).toBeNull();
  });
});

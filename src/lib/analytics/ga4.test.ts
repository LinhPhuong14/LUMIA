import { afterEach, describe, expect, it } from "vitest";

import { normalizePropertyId, syntheticExclusionFilter } from "@/lib/analytics/ga4";

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

describe("syntheticExclusionFilter", () => {
  const keys = [
    "GA4_EXCLUDE_SYNTHETIC",
    "GA4_SYNTHETIC_DIMENSION",
    "GA4_SYNTHETIC_VALUE",
  ] as const;

  afterEach(() => {
    for (const key of keys) {
      delete process.env[key];
    }
  });

  it("tắt mặc định — không đăng ký custom dimension thì đừng thêm bộ lọc gây lỗi", () => {
    expect(syntheticExclusionFilter()).toBeNull();
    process.env.GA4_EXCLUDE_SYNTHETIC = "false";
    expect(syntheticExclusionFilter()).toBeNull();
  });

  it("bật thì loại đúng data_source = synthetic_load_test bằng notExpression", () => {
    process.env.GA4_EXCLUDE_SYNTHETIC = "true";
    expect(syntheticExclusionFilter()).toEqual({
      notExpression: {
        filter: {
          fieldName: "customEvent:data_source",
          stringFilter: { matchType: "EXACT", value: "synthetic_load_test" },
        },
      },
    });
  });

  it("cho phép đổi tên dimension và giá trị qua env", () => {
    process.env.GA4_EXCLUDE_SYNTHETIC = "true";
    process.env.GA4_SYNTHETIC_DIMENSION = "customEvent:traffic_type";
    process.env.GA4_SYNTHETIC_VALUE = "internal";
    const filter = syntheticExclusionFilter() as {
      notExpression: { filter: { fieldName: string; stringFilter: { value: string } } };
    };
    expect(filter.notExpression.filter.fieldName).toBe("customEvent:traffic_type");
    expect(filter.notExpression.filter.stringFilter.value).toBe("internal");
  });
});

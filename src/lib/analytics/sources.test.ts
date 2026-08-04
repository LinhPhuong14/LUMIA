import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { normalizePropertyId } from "@/lib/analytics/ga4";
import { resolveSiteUrl } from "@/lib/analytics/search-console";

describe("normalizePropertyId", () => {
  it("chấp nhận cả ID trần lẫn dạng properties/<id>", () => {
    expect(normalizePropertyId("123456789")).toBe("123456789");
    expect(normalizePropertyId("properties/123456789")).toBe("123456789");
    expect(normalizePropertyId(" 123456789 ")).toBe("123456789");
  });

  it("từ chối giá trị không phải số — tránh gọi API với property rác", () => {
    expect(normalizePropertyId(undefined)).toBeNull();
    expect(normalizePropertyId("")).toBeNull();
    expect(normalizePropertyId("G-ABC123")).toBeNull();
  });
});

describe("resolveSiteUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GSC_SITE_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://www.lumia.com.vn";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("mặc định lấy APP_URL và thêm dấu / cuối như property URL prefix yêu cầu", () => {
    expect(resolveSiteUrl()).toBe("https://www.lumia.com.vn/");
  });

  it("thêm dấu / cuối cho GSC_SITE_URL nếu thiếu", () => {
    process.env.GSC_SITE_URL = "https://lumia.com.vn";
    expect(resolveSiteUrl()).toBe("https://lumia.com.vn/");
  });

  it("giữ nguyên domain property dạng sc-domain:", () => {
    process.env.GSC_SITE_URL = "sc-domain:lumia.com.vn";
    expect(resolveSiteUrl()).toBe("sc-domain:lumia.com.vn");
  });
});

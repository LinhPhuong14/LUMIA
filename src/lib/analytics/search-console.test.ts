import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { pickBestSite, resolveSiteUrl, type GscSite } from "@/lib/analytics/search-console";

const APP = "https://www.lumia.com.vn";

function site(siteUrl: string, permissionLevel = "siteOwner"): GscSite {
  return { siteUrl, permissionLevel };
}

describe("pickBestSite", () => {
  it("ưu tiên domain property vì nó bao trọn cả www lẫn non-www", () => {
    const sites = [
      site("https://www.lumia.com.vn/"),
      site("sc-domain:lumia.com.vn"),
      site("https://lumia.com.vn/"),
    ];
    expect(pickBestSite(sites, APP)).toBe("sc-domain:lumia.com.vn");
  });

  it("không có domain property thì lấy URL prefix trùng đúng host", () => {
    const sites = [site("https://lumia.com.vn/"), site("https://www.lumia.com.vn/")];
    expect(pickBestSite(sites, APP)).toBe("https://www.lumia.com.vn/");
  });

  it("chỉ verify non-www nhưng app chạy ở www thì vẫn nhận ra cùng tên miền gốc", () => {
    expect(pickBestSite([site("https://lumia.com.vn/")], APP)).toBe("https://lumia.com.vn/");
  });

  it("bỏ qua property chưa được verify cho service account", () => {
    const sites = [
      site("sc-domain:lumia.com.vn", "siteUnverifiedUser"),
      site("https://www.lumia.com.vn/"),
    ];
    expect(pickBestSite(sites, APP)).toBe("https://www.lumia.com.vn/");
  });

  it("không có property nào của domain này thì trả null thay vì chọn bừa", () => {
    expect(pickBestSite([site("sc-domain:example.com")], APP)).toBeNull();
    expect(pickBestSite([], APP)).toBeNull();
  });

  it("mọi property đều chưa verify thì cũng trả null", () => {
    expect(pickBestSite([site("sc-domain:lumia.com.vn", "siteUnverifiedUser")], APP)).toBeNull();
  });

  it("khớp không phân biệt hoa thường, nhưng trả về nguyên văn để gọi API", () => {
    expect(pickBestSite([site("SC-DOMAIN:LUMIA.COM.VN")], APP)).toBe("SC-DOMAIN:LUMIA.COM.VN");
  });

  it("không nhầm domain khác chỉ vì trùng phần đuôi", () => {
    expect(pickBestSite([site("sc-domain:notlumia.com.vn")], APP)).toBeNull();
  });
});

describe("resolveSiteUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GSC_SITE_URL;
    process.env.NEXT_PUBLIC_APP_URL = APP;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("giữ nguyên domain property, không thêm dấu / vào cuối", () => {
    process.env.GSC_SITE_URL = "sc-domain:lumia.com.vn";
    expect(resolveSiteUrl()).toBe("sc-domain:lumia.com.vn");
  });

  it("thêm dấu / cuối cho URL prefix", () => {
    process.env.GSC_SITE_URL = "https://lumia.com.vn";
    expect(resolveSiteUrl()).toBe("https://lumia.com.vn/");
  });

  it("bỏ trống thì suy từ APP_URL", () => {
    expect(resolveSiteUrl()).toBe("https://www.lumia.com.vn/");
  });
});

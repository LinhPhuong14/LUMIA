import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  absoluteUrl,
  DISALLOWED_CRAWL_PATHS,
  isCrawlablePath,
  isIndexableDeployment,
  STATIC_SITEMAP_ROUTES,
} from "@/lib/seo";

describe("absoluteUrl", () => {
  it("ghép base + path, chuẩn hoá dấu /", () => {
    expect(absoluteUrl("/store", "https://lumia.com.vn")).toBe("https://lumia.com.vn/store");
    expect(absoluteUrl("store", "https://lumia.com.vn/")).toBe("https://lumia.com.vn/store");
  });

  it("trang chủ luôn có dấu / cuối", () => {
    expect(absoluteUrl("/", "https://lumia.com.vn")).toBe("https://lumia.com.vn/");
  });
});

describe("isCrawlablePath", () => {
  it("cho phép route công khai", () => {
    expect(isCrawlablePath("/")).toBe(true);
    expect(isCrawlablePath("/store")).toBe(true);
    expect(isCrawlablePath("/blog/giac-ngu-va-cam-xuc")).toBe(true);
  });

  it("chặn route riêng tư và các route con", () => {
    expect(isCrawlablePath("/admin")).toBe(false);
    expect(isCrawlablePath("/admin/orders")).toBe(false);
    expect(isCrawlablePath("/api/streak/log")).toBe(false);
    expect(isCrawlablePath("/dashboard/store")).toBe(false);
  });

  it("không chặn nhầm route chỉ trùng prefix chuỗi", () => {
    expect(isCrawlablePath("/aichemy")).toBe(true);
  });
});

describe("STATIC_SITEMAP_ROUTES", () => {
  it("mọi route trong sitemap đều được phép crawl", () => {
    for (const route of STATIC_SITEMAP_ROUTES) {
      expect(isCrawlablePath(route.path), `${route.path} bị chặn trong robots.txt`).toBe(true);
    }
  });

  it("không có path trùng lặp", () => {
    const paths = STATIC_SITEMAP_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("priority nằm trong khoảng hợp lệ 0..1", () => {
    for (const route of STATIC_SITEMAP_ROUTES) {
      expect(route.priority).toBeGreaterThan(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });

  it("mọi prefix bị chặn đều bắt đầu bằng /", () => {
    for (const path of DISALLOWED_CRAWL_PATHS) {
      expect(path.startsWith("/")).toBe(true);
    }
  });
});

describe("isIndexableDeployment", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.VERCEL_ENV;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("chỉ index trên deploy production của Vercel", () => {
    process.env.VERCEL_ENV = "production";
    expect(isIndexableDeployment()).toBe(true);

    process.env.VERCEL_ENV = "preview";
    expect(isIndexableDeployment()).toBe(false);

    process.env.VERCEL_ENV = "development";
    expect(isIndexableDeployment()).toBe(false);
  });

  it("ngoài Vercel: chặn localhost, cho phép domain thật", () => {
    expect(isIndexableDeployment()).toBe(false);

    process.env.NEXT_PUBLIC_APP_URL = "https://www.lumia.com.vn";
    expect(isIndexableDeployment()).toBe(true);
  });
});

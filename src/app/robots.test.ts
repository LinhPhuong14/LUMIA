import { afterEach, beforeEach, describe, expect, it } from "vitest";

import robots from "@/app/robots";

describe("robots.txt", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://www.lumia.com.vn";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("production: cho crawl, chặn vùng riêng tư và khai báo sitemap", () => {
    process.env.VERCEL_ENV = "production";

    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(rule.allow).toBe("/");
    expect(rule.disallow).toContain("/admin");
    expect(rule.disallow).toContain("/api");
    expect(rule.disallow).not.toContain("/store");
    expect(result.sitemap).toBe("https://www.lumia.com.vn/sitemap.xml");
  });

  it("preview: chặn toàn bộ và không khai báo sitemap", () => {
    process.env.VERCEL_ENV = "preview";

    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(rule.disallow).toBe("/");
    expect(rule.allow).toBeUndefined();
    expect(result.sitemap).toBeUndefined();
  });
});

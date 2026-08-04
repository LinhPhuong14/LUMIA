import { getAppUrl, isLocalhostUrl } from "@/lib/app-url";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapRoute = {
  path: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
};

/**
 * Các route công khai, render tĩnh — nguồn sự thật cho `/sitemap.xml`.
 * Route động (blog post, sản phẩm store) được nối thêm trong `src/app/sitemap.ts`.
 */
export const STATIC_SITEMAP_ROUTES: SitemapRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/store", changeFrequency: "weekly", priority: 0.9 },
  { path: "/boxes", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "daily", priority: 0.7 },
  { path: "/quiz", changeFrequency: "monthly", priority: 0.6 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
  { path: "/register", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Prefix không được index: khu vực cần đăng nhập, API, luồng thanh toán.
 * Robots.txt so khớp theo prefix nên `/admin` chặn luôn `/admin/*`.
 */
export const DISALLOWED_CRAWL_PATHS = [
  "/api",
  "/admin",
  "/dashboard",
  "/account",
  "/settings",
  "/journal",
  "/journey",
  "/history",
  "/ai",
  "/audio",
  "/feedback",
  "/mood-test",
  "/onboarding",
  "/checkout",
  "/auth",
  "/oauth",
];

/** Ghép path tương đối thành absolute URL, không để lọt dấu `/` thừa. */
export function absoluteUrl(path: string, baseUrl: string = getAppUrl()): string {
  const base = baseUrl.replace(/\/$/, "");
  if (!path || path === "/") {
    return `${base}/`;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `true` nếu path nằm ngoài vùng chặn crawl. */
export function isCrawlablePath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return !DISALLOWED_CRAWL_PATHS.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

/**
 * Chỉ deploy production mới được index. Preview trên Vercel và local dev
 * phải trả `Disallow: /` để không cạnh tranh nội dung với domain chính.
 */
export function isIndexableDeployment(): boolean {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === "production";
  }
  return !isLocalhostUrl(getAppUrl());
}

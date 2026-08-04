import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";
import { DISALLOWED_CRAWL_PATHS, isIndexableDeployment } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppUrl();

  // Preview deploy / local dev: chặn hoàn toàn để không trùng nội dung với domain chính.
  if (!isIndexableDeployment()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_CRAWL_PATHS,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

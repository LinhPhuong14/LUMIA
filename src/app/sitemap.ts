import type { MetadataRoute } from "next";

import { BLOG_POSTS } from "@/data/blog-posts";
import { getAllPurchasableProducts } from "@/data/catalog";
import { absoluteUrl, STATIC_SITEMAP_ROUTES } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";

/** Sitemap build lại mỗi giờ — đủ tươi cho blog/store mà không tốn request. */
export const revalidate = 3600;

type DynamicEntry = { path: string; lastModified?: Date };

/** Bài blog đã publish; fallback về data tĩnh khi chưa cấu hình Supabase. */
async function getBlogEntries(): Promise<DynamicEntry[]> {
  const supabase = createPublicClient();

  if (supabase) {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,published_at,updated_at")
      .eq("published", true);

    if (data && data.length > 0) {
      return data.map((post) => ({
        path: `/blog/${post.slug}`,
        lastModified: toDate(post.updated_at ?? post.published_at),
      }));
    }
  }

  return BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: toDate(post.publishedAt),
  }));
}

/** Sản phẩm store còn bán. */
async function getStoreEntries(): Promise<DynamicEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }

  const { data } = await supabase.from("store_products").select("slug,updated_at");

  return (data ?? []).map((product) => ({
    path: `/store/${product.slug}`,
    lastModified: toDate(product.updated_at),
  }));
}

/** Các gói LUMIA — slug lấy từ catalog tĩnh nên luôn có mặt. */
function getBoxEntries(): DynamicEntry[] {
  return getAllPurchasableProducts().map((box) => ({ path: `/boxes/${box.slug}` }));
}

function toDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Sitemap không được fail cả build chỉ vì Supabase tạm lỗi.
  const [blogEntries, storeEntries] = await Promise.all([
    getBlogEntries().catch(() => [] as DynamicEntry[]),
    getStoreEntries().catch(() => [] as DynamicEntry[]),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...getBoxEntries(),
    ...storeEntries,
    ...blogEntries,
  ].map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.lastModified ?? now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Khử trùng lặp phòng khi slug catalog và slug DB chồng nhau.
  const seen = new Set<string>();
  return [...staticEntries, ...dynamicEntries].filter((entry) => {
    if (seen.has(entry.url)) {
      return false;
    }
    seen.add(entry.url);
    return true;
  });
}

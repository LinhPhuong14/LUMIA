import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { parseBlogLimit, sortedStaticPosts } from "@/lib/blog-query";

type ApiPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  emoji: string | null;
  cover_color: string | null;
  cover_image_url: string | null;
  read_time: number | null;
  published_at: string | null;
};

/** Cùng cách rơi về dữ liệu tĩnh như `/blog` và khối blog trang chủ. */
function staticPosts(limit: number): ApiPost[] {
  return sortedStaticPosts(limit).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    emoji: p.emoji,
    cover_color: p.coverColor,
    cover_image_url: null,
    read_time: p.readTime,
    published_at: p.publishedAt,
  }));
}

export async function GET(req: Request) {
  const limit = parseBlogLimit(new URL(req.url).searchParams.get("limit"));

  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ posts: staticPosts(limit) });

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,category,emoji,cover_color,cover_image_url,read_time,published_at",
    )
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ posts: [] });
  if (!data || data.length === 0) return NextResponse.json({ posts: staticPosts(limit) });

  return NextResponse.json({ posts: data });
}

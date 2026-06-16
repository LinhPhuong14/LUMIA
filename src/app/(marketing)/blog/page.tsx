import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BLOG_POSTS } from "@/data/blog-posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | LUMIA",
  description: "Kiến thức về giấc ngủ, thiền định và sức khỏe tinh thần từ đội ngũ LUMIA.",
};

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  emoji: string;
  cover_color: string;
  read_time: number;
  published_at: string;
};

async function getPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,title,excerpt,category,emoji,cover_color,read_time,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (data && data.length > 0) return data as BlogPost[];
  }
  // Fall back to static data
  return BLOG_POSTS.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    emoji: p.emoji,
    cover_color: p.coverColor,
    read_time: p.readTime,
    published_at: p.publishedAt,
  }));
}

export default async function BlogPage() {
  const posts = await getPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <main className="marketing-page landing-page">
      <div className="landing-frame py-16">
        <div className="mb-12">
          <span className="lumia-kicker">- Góc kiến thức</span>
          <h1 className="lumia-h2 mt-2">Blog Lumia.</h1>
          <p className="mt-3 max-w-[520px] text-base leading-relaxed text-[var(--muted)]">
            Khoa học giấc ngủ, nghi thức wellbeing và câu chuyện từ cộng đồng LUMIA.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span key={cat} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-[13px] font-medium text-[var(--foreground)]">
              {cat}
            </span>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
            >
              <div className="flex h-44 items-center justify-center text-6xl" style={{ background: post.cover_color }}>
                {post.emoji}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">{post.read_time} phút đọc</span>
                </div>
                <h2 className="font-serif text-[18px] font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--green-deep)]">
                  {post.title}
                </h2>
                <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">{new Date(post.published_at).toLocaleDateString("vi-VN")}</span>
                  <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--green)]">
                    Đọc tiếp <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

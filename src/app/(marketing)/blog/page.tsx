import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog | LUMIA",
  description: "Kiến thức về giấc ngủ, thiền định và sức khỏe tinh thần từ đội ngũ LUMIA.",
};

const CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category)));

export default function BlogPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
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
          {CATEGORIES.map((cat) => (
            <span key={cat} className="rounded-full border border-[var(--border)] px-4 py-1.5 text-[13px] font-medium text-[var(--foreground)]">
              {cat}
            </span>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
            >
              <div className="flex h-44 items-center justify-center text-6xl" style={{ background: post.coverColor }}>
                {post.emoji}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">{post.readTime} phút đọc</span>
                </div>
                <h2 className="font-serif text-[18px] font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--green-deep)] transition-colors">
                  {post.title}
                </h2>
                <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--muted)]">{new Date(post.publishedAt).toLocaleDateString("vi-VN")}</span>
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

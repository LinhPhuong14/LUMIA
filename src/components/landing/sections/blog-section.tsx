import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRecentPosts } from "@/data/blog-posts";

export function BlogSection() {
  const posts = getRecentPosts(3);
  return (
    <section className="px-4 py-20 sm:py-28" style={{ background: "var(--surface)" }}>
      <div className="shell">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="lumia-kicker">— Góc kiến thức</p>
            <h2 className="lumia-h2 mt-2">Blog Lumia.</h2>
          </div>
          <Link href="/blog" className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--green)] hover:underline underline-offset-2">
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
            >
              <div className="flex h-40 items-center justify-center text-5xl" style={{ background: post.coverColor }}>
                {post.emoji}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}>
                    {post.category}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">{post.readTime} phút đọc</span>
                </div>
                <h3 className="font-serif text-[17px] font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--green-deep)] transition-colors">
                  {post.title}
                </h3>
                <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{post.excerpt}</p>
                <div className="flex items-center gap-1 text-[12px] font-semibold text-[var(--green)]">
                  Đọc tiếp <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

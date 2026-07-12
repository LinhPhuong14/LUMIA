import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { BLOG_POSTS } from "@/data/blog-posts";

// Gating handled by src/proxy.ts (see note in admin/page.tsx). Do not re-gate
// here with requireRole() — the RLS-scoped read collapses admins to "user".
export default async function AdminBlogPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <AdminPageShell title="Blog">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{BLOG_POSTS.length} bài viết (dữ liệu tĩnh)</p>
        <Link
          href="/blog"
          target="_blank"
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-matcha-text"
        >
          Xem blog <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((post) => (
          <div
            key={post.slug}
            className="soft-card flex flex-col gap-3 overflow-hidden p-0"
          >
            <div
              className="flex h-28 items-center justify-center text-4xl"
              style={{ background: post.coverColor }}
            >
              {post.emoji}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-matcha-soft px-2.5 py-0.5 text-[11px] font-semibold text-matcha-deep">
                  {post.category}
                </span>
                <span className="text-[11px] text-muted">{post.readTime} phút đọc</span>
              </div>
              <h3 className="font-serif text-[15px] font-semibold leading-snug text-matcha-deep">
                {post.title}
              </h3>
              <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted">{post.excerpt}</p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-[11px] text-muted">
                  {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="flex items-center gap-1 text-[12px] font-medium text-matcha-text hover:underline"
                >
                  Xem <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}

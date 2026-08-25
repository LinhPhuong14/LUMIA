"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BookOpen, ChevronRight } from "lucide-react";

import { Panel } from "@/components/dashboard/shell/panel";

/**
 * Khối "Góc kiến thức" trong dashboard.
 *
 * Đây KHÔNG phải một vị trí SEO. `/dashboard` nằm trong `DISALLOWED_CRAWL_PATHS`
 * (xem `src/lib/seo.ts`) nên robots.txt chặn, Googlebot không bao giờ đọc tới
 * và mọi link ở đây không truyền một chút thẩm quyền nào. Đừng tính nó vào khi
 * cân đối internal linking.
 *
 * Lý do nó tồn tại là giữ chân người dùng: dashboard là nơi người đã đăng ký
 * quay lại thường xuyên nhất, và bài viết về giấc ngủ đúng là thứ họ đang quan
 * tâm ngay lúc mở app. Đo hiệu quả của khối này bằng lượt đọc lặp lại, không
 * phải bằng thứ hạng tìm kiếm.
 */

const WIDGET_POST_LIMIT = 3;

type WidgetPost = {
  slug: string;
  title: string;
  category: string;
  emoji: string | null;
  cover_color: string | null;
  cover_image_url: string | null;
  read_time: number | null;
};

export function BlogWidget() {
  const [posts, setPosts] = useState<WidgetPost[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/blog?limit=${WIDGET_POST_LIMIT}`)
      .then((r) => r.json())
      .then((data: { posts?: WidgetPost[] }) => {
        // Người dùng có thể rời dashboard trước khi request về; set state lúc đó
        // là cập nhật lên component đã unmount.
        if (alive) setPosts(Array.isArray(data.posts) ? data.posts : []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Chưa có bài thì không dựng một khối rỗng chiếm chỗ giữa dashboard.
  if (posts.length === 0) {
    return null;
  }

  return (
    <Panel pad="p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--green)]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green)]">
            Góc kiến thức
          </span>
        </div>
        <Link
          href="/blog"
          className="flex items-center gap-1 text-[12px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Xem tất cả
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}` as Route}
            className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--green)]/40 hover:bg-[var(--surface-card)]"
          >
            {post.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image_url}
                alt=""
                className="h-11 w-11 shrink-0 rounded-[12px] object-cover"
              />
            ) : (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-[20px]"
                style={{ background: post.cover_color ?? "var(--green-wash)" }}
                aria-hidden="true"
              >
                {post.emoji ?? "🌿"}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--foreground)]">
                {post.title}
              </p>
              <p className="mt-0.5 truncate text-[11.5px] text-[var(--muted)]">
                {post.category}
                {post.read_time ? ` · ${post.read_time} phút đọc` : ""}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
          </Link>
        ))}
      </div>

      <Link
        href="/blog"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--border)] py-2.5 text-[13px] font-medium text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--foreground)]"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Đọc thêm trên blog
      </Link>
    </Panel>
  );
}

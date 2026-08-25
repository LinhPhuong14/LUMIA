import Link from "next/link";
import { unstable_cache } from "next/cache";
import { ArrowRight } from "lucide-react";

import { createPublicClient } from "@/lib/supabase/public";
import { sortedStaticPosts } from "@/lib/blog-query";

const HOME_POST_LIMIT = 3;

type SectionPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  emoji: string | null;
  coverColor: string | null;
  coverImageUrl: string | null;
  readTime: number | null;
  publishedAt: string | null;
};

// Bài đã publish hiển thị y hệt cho mọi khách — client anon (không cookie) để
// bọc `unstable_cache` được. Trang chủ đã là dynamic vì `cookies()` ở
// HomePage nên đây là cách duy nhất để không truy vấn lại DB mỗi lượt tải.
const getRecentPosts = unstable_cache(
  async (limit = HOME_POST_LIMIT): Promise<SectionPost[]> => {
    const supabase = createPublicClient();

    if (supabase) {
      const { data } = await supabase
        .from("blog_posts")
        .select(
          "slug,title,excerpt,category,emoji,cover_color,cover_image_url,read_time,published_at",
        )
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (data && data.length > 0) {
        return data.map((post) => ({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          emoji: post.emoji,
          coverColor: post.cover_color,
          coverImageUrl: post.cover_image_url ?? null,
          readTime: post.read_time,
          publishedAt: post.published_at,
        }));
      }
    }

    // Cùng cách rơi về dữ liệu tĩnh như `/blog`, để trang chủ và trang danh sách
    // không bao giờ nói hai điều khác nhau về việc blog có bài hay không.
    return sortedStaticPosts(limit).map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      emoji: post.emoji,
      coverColor: post.coverColor,
      coverImageUrl: null,
      readTime: post.readTime,
      publishedAt: post.publishedAt,
    }));
  },
  ["landing-recent-posts"],
  { revalidate: 60, tags: ["blog-posts"] },
);

export async function BlogSection() {
  const posts = await getRecentPosts();

  return (
    // `id` để điều hướng trong trang trỏ tới được, và để link ngoài có thể sâu
    // thẳng vào đúng khối này.
    <section id="goc-kien-thuc" className="px-4 py-20 sm:py-28" style={{ background: "var(--surface)" }}>
      <div className="shell">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="lumia-kicker">— Góc kiến thức</p>
            <h2 className="lumia-h2 mt-2">Blog Lumia.</h2>
          </div>
          <Link
            href="/blog"
            className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--green)] underline-offset-2 hover:underline"
          >
            Xem tất cả <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] py-16 text-center">
            <span className="text-4xl">🌱</span>
            <p className="mt-4 font-serif text-[18px] text-[var(--foreground)]">
              Nội dung đang được chuẩn bị
            </p>
            <p className="mt-2 text-[13px] text-[var(--muted)]">
              Những bài viết đầu tiên sẽ sớm xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.slug} className="flex">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-1 flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
                >
                  {post.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-40 items-center justify-center text-5xl"
                      style={{ background: post.coverColor ?? "var(--green-wash)" }}
                      aria-hidden="true"
                    >
                      {post.emoji ?? "🌿"}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}
                      >
                        {post.category}
                      </span>
                      {post.readTime ? (
                        <span className="text-[11px] text-[var(--muted)]">
                          {post.readTime} phút đọc
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-serif text-[17px] font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--green-deep)]">
                      {post.title}
                    </h3>
                    <p className="line-clamp-2 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      {post.publishedAt ? (
                        <time dateTime={post.publishedAt} className="text-[12px] text-[var(--muted)]">
                          {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                        </time>
                      ) : (
                        <span />
                      )}
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-[var(--green)]">
                        Đọc tiếp <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

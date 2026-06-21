import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type DbPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  emoji: string | null;
  cover_color: string | null;
  read_time: number | null;
  cover_image_url?: string | null;
};

async function getRecentDbPosts(limit = 3): Promise<DbPost[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,category,emoji,cover_color,read_time,cover_image_url")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function BlogSection() {
  const posts = await getRecentDbPosts(3);
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
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] py-16 text-center">
            <span className="text-4xl">🌱</span>
            <p className="mt-4 font-serif text-[18px] text-[var(--foreground)]">Nội dung đang được chuẩn bị</p>
            <p className="mt-2 text-[13px] text-[var(--muted)]">Những bài viết đầu tiên sẽ sớm xuất hiện ở đây.</p>
          </div>
        ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
            >
              {post.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.cover_image_url} alt={post.title} className="h-40 w-full object-cover" />
              ) : (
                <div
                  className="flex h-40 items-center justify-center text-5xl"
                  style={{ background: post.cover_color ?? "var(--green-wash)" }}
                >
                  {post.emoji ?? "🌿"}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}>
                    {post.category}
                  </span>
                  {post.read_time && (
                    <span className="text-[11px] text-[var(--muted)]">{post.read_time} phút đọc</span>
                  )}
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
        )}
      </div>
    </section>
  );
}

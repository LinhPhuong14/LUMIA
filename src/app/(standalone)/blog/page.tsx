import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/marketing/site-footer";
import { createPublicClient } from "@/lib/supabase/public";
import { sortedStaticPosts } from "@/lib/blog-query";
import {
  BLOG_BASE_PATH,
  buildBlogListingSchema,
  buildBreadcrumbSchema,
} from "@/lib/blog-seo";

export const revalidate = 60;

const BLOG_DESCRIPTION =
  "Kiến thức về giấc ngủ, thiền định và sức khỏe tinh thần từ đội ngũ LUMIA.";

export const metadata: Metadata = {
  title: "Blog",
  description: BLOG_DESCRIPTION,
  // Canonical tuyệt đối: `/blog` có thể tới từ nhiều nguồn kèm tham số UTM, và
  // mỗi biến thể ?utm_source=... là một URL riêng dưới mắt Google. Không chốt
  // bản chính tắc thì thứ hạng bị chia đều cho các bản trùng.
  alternates: { canonical: BLOG_BASE_PATH },
  openGraph: {
    type: "website",
    title: "Blog | LUMIA",
    description: BLOG_DESCRIPTION,
    url: BLOG_BASE_PATH,
    siteName: "LUMIA",
    locale: "vi_VN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | LUMIA",
    description: BLOG_DESCRIPTION,
  },
};

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  emoji: string;
  cover_color: string;
  cover_image_url: string | null;
  read_time: number;
  published_at: string;
};

async function getPosts(): Promise<BlogPost[]> {
  // Client anon (không cookie): danh sách bài publish giống hệt cho mọi
  // khách, và trang này có `revalidate = 60` ở trên — dùng client gắn cookie
  // ở đây sẽ ép Next coi cả route là dynamic, vô hiệu hoá ISR đã khai báo.
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase
      .from("blog_posts")
      .select(
        "slug,title,excerpt,category,emoji,cover_color,cover_image_url,read_time,published_at",
      )
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (data && data.length > 0) return data as BlogPost[];
  }
  // Fall back to static data.
  return sortedStaticPosts().map((p) => ({
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

/** Ảnh bìa thật nếu có, không thì nền gradient + emoji như thiết kế gốc. */
function PostCover({
  post,
  className,
  emojiClassName,
}: {
  post: BlogPost;
  className: string;
  emojiClassName: string;
}) {
  if (post.cover_image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={post.cover_image_url}
        alt={post.title}
        className={`${className} w-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${className} flex items-center justify-center ${emojiClassName}`}
      style={{ background: post.cover_color }}
      aria-hidden="true"
    >
      {post.emoji}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}
    >
      {category}
    </span>
  );
}

export default async function BlogPage() {
  const posts = await getPosts();
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  // Bài mới nhất lên khối lớn đầu trang, phần còn lại xuống lưới. Người đọc
  // vào một trang danh sách toàn thẻ giống hệt nhau thì không có điểm bám mắt;
  // một bài nổi bật cho họ chỗ bắt đầu, và cho bài mới nhất đường link đậm nhất
  // trên trang.
  const [featured, ...rest] = posts;

  const listingSchema = buildBlogListingSchema(
    posts.map((p) => ({ slug: p.slug, title: p.title, publishedAt: p.published_at })),
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: BLOG_BASE_PATH },
  ]);

  return (
    <>
      <JsonLd data={listingSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="marketing-page landing-page">
        <div className="landing-frame py-12 sm:py-16">
          {/* Breadcrumb hiển thị — cùng đường dẫn với BreadcrumbList ở JSON-LD. */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
              <li>
                <Link href="/" className="transition-colors hover:text-[var(--foreground)]">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li aria-current="page" className="font-medium text-[var(--foreground)]">
                Blog
              </li>
            </ol>
          </nav>

          <header className="mb-10">
            <p className="lumia-kicker">- Góc kiến thức</p>
            <h1 className="lumia-h2 mt-2">Blog Lumia.</h1>
            <p className="mt-3 max-w-[520px] text-base leading-relaxed text-[var(--muted)]">
              Khoa học giấc ngủ, nghi thức wellbeing và câu chuyện từ cộng đồng LUMIA.
            </p>
          </header>

          {categories.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full border border-[var(--border)] px-4 py-1.5 text-[13px] font-medium text-[var(--foreground)]"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--border)] py-20 text-center">
              <span className="text-4xl">🌱</span>
              <p className="mt-4 font-serif text-[18px] text-[var(--foreground)]">
                Nội dung đang được chuẩn bị
              </p>
              <p className="mt-2 text-[13px] text-[var(--muted)]">
                Những bài viết đầu tiên sẽ sớm xuất hiện ở đây.
              </p>
            </div>
          ) : (
            <>
              {/* ── Bài nổi bật ── */}
              <article className="mb-12">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid gap-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(0,0,0,0.10)] lg:grid-cols-[1.15fr_1fr]"
                >
                  <PostCover
                    post={featured}
                    className="h-56 sm:h-72 lg:h-full lg:min-h-[320px]"
                    emojiClassName="text-7xl"
                  />
                  <div className="flex flex-col justify-center gap-4 p-6 sm:p-9">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em]"
                        style={{ background: "var(--green)", color: "#fff" }}
                      >
                        Mới nhất
                      </span>
                      <CategoryBadge category={featured.category} />
                      <span className="text-[11px] text-[var(--muted)]">
                        {featured.read_time} phút đọc
                      </span>
                    </div>
                    <h2 className="font-serif text-[22px] font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--green-deep)] sm:text-[28px]">
                      {featured.title}
                    </h2>
                    <p className="line-clamp-3 text-[14px] leading-relaxed text-[var(--muted)]">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <time
                        dateTime={featured.published_at}
                        className="text-[12px] text-[var(--muted)]"
                      >
                        {formatDate(featured.published_at)}
                      </time>
                      <span className="flex items-center gap-1 text-[13px] font-semibold text-[var(--green)]">
                        Đọc bài <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>

              {/* ── Các bài còn lại ── */}
              {rest.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <article key={post.slug} className="flex">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex flex-1 flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
                      >
                        <PostCover post={post} className="h-44" emojiClassName="text-6xl" />
                        <div className="flex flex-1 flex-col gap-3 p-6">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={post.category} />
                            <span className="text-[11px] text-[var(--muted)]">
                              {post.read_time} phút đọc
                            </span>
                          </div>
                          <h2 className="font-serif text-[18px] font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--green-deep)]">
                            {post.title}
                          </h2>
                          <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <time
                              dateTime={post.published_at}
                              className="text-[12px] text-[var(--muted)]"
                            >
                              {formatDate(post.published_at)}
                            </time>
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
            </>
          )}
        </div>

        {/* Footer đầy đủ thay cho trang cụt: người đọc hết bài có đường đi tiếp,
            và mỗi trang blog trả link về store / about / trang chủ thay vì giữ
            hết thẩm quyền cho riêng nó. */}
        <SiteFooter />
      </main>
    </>
  );
}

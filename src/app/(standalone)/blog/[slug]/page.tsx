import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock, Tag } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { SiteFooter } from "@/components/marketing/site-footer";
import { createClient } from "@/lib/supabase/server";
import { BLOG_POSTS, getBlogPost } from "@/data/blog-posts";
import {
  BLOG_BASE_PATH,
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/blog-seo";

export const revalidate = 60;

const RELATED_LIMIT = 3;

type Post = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  coverColor: string;
  coverImageUrl: string | null;
  readTime: number;
  publishedAt: string;
  updatedAt: string | null;
};

type RelatedPost = {
  slug: string;
  title: string;
  category: string;
  emoji: string;
  coverColor: string;
  coverImageUrl: string | null;
  readTime: number;
};

/**
 * Lấy bài đã publish từ DB; chỉ rơi về nội dung seed tĩnh khi DB CHƯA có bài
 * nào được đăng.
 *
 * Điều kiện "chưa có bài nào" là chỗ quan trọng, và bản cũ thiếu nó. Bản cũ rơi
 * về seed mỗi khi truy vấn không trả về dòng nào — mà "không trả về dòng nào"
 * gồm cả trường hợp bài đó đang ở trạng thái nháp hoặc vừa bị ẩn. Hậu quả: một
 * bài nháp trùng slug với bài seed vẫn mở ra được và hiện nội dung seed, tức là
 * nút Ẩn không thật sự ẩn được bài. Nó cũng lệch với trang danh sách — trang đó
 * chỉ rơi về seed khi DB rỗng — nên hai trang có thể nói hai điều khác nhau về
 * cùng một URL.
 *
 * Giờ DB một khi đã có bài publish thì là nguồn sự thật duy nhất: không khớp
 * nghĩa là 404.
 */
async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("blog_posts")
      .select(
        "title,excerpt,content,category,emoji,cover_color,cover_image_url,read_time,published_at,updated_at",
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (data) {
      return {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content ?? "",
        category: data.category,
        emoji: data.emoji,
        coverColor: data.cover_color,
        coverImageUrl: data.cover_image_url ?? null,
        readTime: data.read_time,
        publishedAt: data.published_at,
        updatedAt: data.updated_at ?? null,
      };
    }

    // Đếm nhẹ bằng `head: true` — chỉ lấy con số, không kéo dòng nào về.
    const { count } = await supabase
      .from("blog_posts")
      .select("slug", { count: "exact", head: true })
      .eq("published", true);

    if ((count ?? 0) > 0) {
      return null;
    }
  }
  const s = getBlogPost(slug);
  if (!s) return null;
  return {
    title: s.title,
    excerpt: s.excerpt,
    content: s.content ?? s.excerpt,
    category: s.category,
    emoji: s.emoji,
    coverColor: s.coverColor,
    coverImageUrl: null,
    readTime: s.readTime,
    publishedAt: s.publishedAt,
    updatedAt: null,
  };
}

/**
 * Bài liên quan: ưu tiên cùng chuyên mục, thiếu thì bù bằng bài mới nhất.
 *
 * Đây là phần internal linking quan trọng nhất của blog. Một bài viết không link
 * ra đâu là ngõ cụt: người đọc xong thì thoát, còn crawler đi vào rồi phải quay
 * ngược ra. Nối các bài cùng chủ đề lại với nhau vừa giữ người đọc, vừa cho
 * Google thấy site có hẳn một cụm nội dung về giấc ngủ chứ không phải vài bài
 * rời rạc.
 */
async function getRelatedPosts(slug: string, category: string): Promise<RelatedPost[]> {
  const supabase = await createClient();

  if (supabase) {
    const columns =
      "slug,title,category,emoji,cover_color,cover_image_url,read_time,published_at";

    const { data: sameCategory } = await supabase
      .from("blog_posts")
      .select(columns)
      .eq("published", true)
      .eq("category", category)
      .neq("slug", slug)
      .order("published_at", { ascending: false })
      .limit(RELATED_LIMIT);

    const picked = [...(sameCategory ?? [])];

    if (picked.length < RELATED_LIMIT) {
      const { data: recent } = await supabase
        .from("blog_posts")
        .select(columns)
        .eq("published", true)
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(RELATED_LIMIT + picked.length + 1);

      for (const post of recent ?? []) {
        if (picked.length >= RELATED_LIMIT) break;
        if (picked.some((p) => p.slug === post.slug)) continue;
        picked.push(post);
      }
    }

    if (picked.length > 0) {
      return picked.slice(0, RELATED_LIMIT).map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        emoji: p.emoji ?? "🌿",
        coverColor: p.cover_color ?? "var(--green-wash)",
        coverImageUrl: p.cover_image_url ?? null,
        readTime: p.read_time ?? 3,
      }));
    }
  }

  // Fallback tĩnh, cùng thứ tự ưu tiên.
  const others = BLOG_POSTS.filter((p) => p.slug !== slug);
  const ranked = [
    ...others.filter((p) => p.category === category),
    ...others.filter((p) => p.category !== category),
  ];
  return ranked.slice(0, RELATED_LIMIT).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    emoji: p.emoji,
    coverColor: p.coverColor,
    coverImageUrl: null,
    readTime: p.readTime,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const url = `${BLOG_BASE_PATH}/${slug}`;

  return {
    title: `${post.title} | LUMIA Blog`,
    description: post.excerpt,
    alternates: { canonical: url },
    // `og:type: article` cho phép khai báo ngày đăng và chuyên mục — Facebook,
    // Zalo và LinkedIn đọc đúng những trường này khi dựng thẻ xem trước.
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      siteName: "LUMIA",
      locale: "vi_VN",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      section: post.category,
      ...(post.coverImageUrl ? { images: [{ url: post.coverImageUrl }] } : {}),
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  };
}

/** Admin RichEditor stores HTML; the static seed uses a lightweight markdown. */
function isHtml(s: string) {
  return /<(p|h[1-6]|div|br|ul|ol|li|strong|em|img|blockquote|a)\b/i.test(s);
}

/**
 * Ảnh giữa bài cho các bài viết ở dạng markdown seed: `![chú thích](url)`.
 *
 * Bài do admin soạn đi đường HTML nên chèn ảnh thoải mái, còn bài nạp từ seed
 * thì trước đây không có cú pháp nào để đặt ảnh vào giữa nội dung — chỉ có mỗi
 * ảnh bìa. Chú thích là tuỳ chọn: `![](url)` ra ảnh trần, không đẻ figcaption
 * rỗng.
 */
const IMAGE_BLOCK = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

function renderMarkdown(content: string) {
  return content.split("\n\n").map((block, i) => {
    const image = block.trim().match(IMAGE_BLOCK);
    if (image) {
      const [, caption, src] = image;
      return (
        <figure key={i} className="my-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={caption} className="w-full rounded-2xl" />
          {caption ? (
            <figcaption className="mt-2.5 text-center text-[13px] leading-relaxed text-[var(--muted)]">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    if (block.startsWith("**") && block.endsWith("**")) {
      // Tiêu đề phụ trong thân bài là h2, không phải h3: h1 là tên bài, nên nhảy
      // thẳng xuống h3 để hổng một bậc khiến Google đọc sai cấu trúc bài viết.
      return <h2 key={i} className="mt-8 font-serif text-[20px] font-semibold text-[var(--foreground)]">{block.slice(2, -2)}</h2>;
    }
    if (block.match(/^\d+\./m)) {
      const lines = block.split("\n").filter(Boolean);
      return <ol key={i} className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-[1.8] text-[var(--muted)]">{lines.map((l, j) => <li key={j}>{l.replace(/^\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>)}</ol>;
    }
    if (block.startsWith("- ")) {
      const lines = block.split("\n").filter(Boolean);
      return <ul key={i} className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-[1.8] text-[var(--muted)]">{lines.map((l, j) => <li key={j}>{l.replace(/^- /, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>)}</ul>;
    }
    const html = block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    return <p key={i} className="mt-4 text-[15px] leading-[1.85] text-[var(--muted)]" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const content = post.content?.trim() ? post.content : post.excerpt;
  const related = await getRelatedPosts(slug, post.category);

  const postingSchema = buildBlogPostingSchema({
    slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    category: post.category,
    coverImageUrl: post.coverImageUrl,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: BLOG_BASE_PATH },
    { name: post.title, path: `${BLOG_BASE_PATH}/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={postingSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="marketing-page landing-page">
        <div className="landing-frame py-10 sm:py-12">
          {/* Breadcrumb thay cho nút "Quay lại": cho biết bài nằm ở đâu trong
              site và trả về hai link thay vì một. */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--muted)]">
              <li>
                <Link href="/" className="transition-colors hover:text-[var(--foreground)]">
                  Trang chủ
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li>
                <Link href="/blog" className="transition-colors hover:text-[var(--foreground)]">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="h-3 w-3" />
              </li>
              <li aria-current="page" className="max-w-[220px] truncate font-medium text-[var(--foreground)]">
                {post.title}
              </li>
            </ol>
          </nav>

          <article>
            {post.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-52 w-full rounded-[28px] object-cover sm:h-72"
              />
            ) : (
              <div
                className="flex h-52 items-center justify-center rounded-[28px] text-7xl sm:h-64"
                style={{ background: post.coverColor }}
                aria-hidden="true"
              >
                {post.emoji}
              </div>
            )}

            <div className="mx-auto mt-8 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--muted)]">
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1"
                  style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}
                >
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {post.readTime} phút đọc
                </span>
                {/* `<time datetime>` là dạng ngày máy đọc được, khớp với
                    `datePublished` trong JSON-LD ngay bên trên. */}
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("vi-VN")}
                </time>
              </div>

              <h1
                className="mt-5 font-serif text-[28px] font-semibold leading-tight sm:text-[36px]"
                style={{ color: "var(--foreground)" }}
              >
                {post.title}
              </h1>
              <p
                className="mt-3 text-[15px] font-medium leading-relaxed"
                style={{ color: "var(--green-deep)" }}
              >
                {post.excerpt}
              </p>

              <div className="mt-8 border-t border-[var(--border)] pt-8">
                {isHtml(content) ? (
                  <div
                    // `lumia-doc` là bộ style dùng chung với editor admin, nên
                    // trang đọc hiện đúng bằng cái người soạn nhìn thấy. Chuỗi
                    // `[&_...]` trước đây chỉ phủ được p/h/ul/ol/img — bảng,
                    // figcaption và checklist do editor sinh ra đều rơi về mặc
                    // định của Preflight, tức là mất viền và mất dấu đầu dòng.
                    className="lumia-doc text-[15px] leading-[1.85] text-[var(--muted)]"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                ) : (
                  renderMarkdown(content)
                )}
              </div>
            </div>
          </article>

          <div className="mx-auto max-w-2xl">
            <div className="mt-12 rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-8 text-center">
              <p className="font-serif text-[20px] font-semibold text-[var(--foreground)]">
                Bắt đầu hành trình ngủ tốt hơn
              </p>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                LUMIA đồng hành cùng bạn với AI lắng nghe, nhật ký cảm xúc và sản phẩm wellbeing.
              </p>
              <Link
                href="/register"
                className="mt-5 inline-flex rounded-full px-8 py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
                style={{ background: "var(--green)" }}
              >
                Dùng thử miễn phí
              </Link>
            </div>
          </div>

          {/* ── Bài liên quan ── */}
          {related.length > 0 && (
            <section aria-labelledby="bai-lien-quan" className="mt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="lumia-kicker">- Đọc tiếp</p>
                  <h2 id="bai-lien-quan" className="mt-2 font-serif text-[22px] font-semibold text-[var(--foreground)]">
                    Bài viết liên quan
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--green)] underline-offset-2 hover:underline"
                >
                  Xem tất cả <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <article key={item.slug} className="flex">
                    <Link
                      href={`/blog/${item.slug}`}
                      className="group flex flex-1 flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] transition hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
                    >
                      {item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="h-36 w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-36 items-center justify-center text-5xl"
                          style={{ background: item.coverColor }}
                          aria-hidden="true"
                        >
                          {item.emoji}
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-2.5 p-5">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}
                          >
                            {item.category}
                          </span>
                          <span className="text-[11px] text-[var(--muted)]">
                            {item.readTime} phút đọc
                          </span>
                        </div>
                        <h3 className="font-serif text-[16px] font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--green-deep)]">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <SiteFooter />
      </main>
    </>
  );
}

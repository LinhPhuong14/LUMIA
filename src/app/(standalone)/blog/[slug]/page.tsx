import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getBlogPost } from "@/data/blog-posts";

export const revalidate = 60;

type Post = {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  coverColor: string;
  readTime: number;
  publishedAt: string;
};

/** Fetch a published post from the DB (admin-managed) by slug; fall back to the
 *  static seed content so pre-DB posts still render. */
async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("blog_posts")
      .select("title,excerpt,content,category,emoji,cover_color,read_time,published_at")
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
        readTime: data.read_time,
        publishedAt: data.published_at,
      };
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
    readTime: s.readTime,
    publishedAt: s.publishedAt,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: `${post.title} | LUMIA Blog`, description: post.excerpt };
}

/** Admin RichEditor stores HTML; the static seed uses a lightweight markdown. */
function isHtml(s: string) {
  return /<(p|h[1-6]|div|br|ul|ol|li|strong|em|img|blockquote|a)\b/i.test(s);
}

function renderMarkdown(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("**") && block.endsWith("**")) {
      return <h3 key={i} className="mt-8 font-serif text-[20px] font-semibold text-[var(--foreground)]">{block.slice(2, -2)}</h3>;
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

  return (
    <main className="marketing-page landing-page">
      <div className="landing-frame py-12">
        <Link href="/blog" className="mb-8 flex items-center gap-2 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại Blog
        </Link>

        <div className="flex h-52 items-center justify-center rounded-[28px] text-7xl sm:h-64" style={{ background: post.coverColor }}>
          {post.emoji}
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--muted)]">
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: "var(--green-wash)", color: "var(--green-deep)" }}>
              <Tag className="h-3 w-3" />{post.category}
            </span>
            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{post.readTime} phút đọc</span>
            <span>{new Date(post.publishedAt).toLocaleDateString("vi-VN")}</span>
          </div>

          <h1 className="mt-5 font-serif text-[28px] font-semibold leading-tight sm:text-[36px]" style={{ color: "var(--foreground)" }}>
            {post.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed font-medium" style={{ color: "var(--green-deep)" }}>{post.excerpt}</p>

          <div className="mt-8 border-t border-[var(--border)] pt-8">
            {isHtml(content) ? (
              <div
                className="text-[15px] leading-[1.85] text-[var(--muted)] [&_a]:text-[var(--green-deep)] [&_a]:underline [&_h1]:mt-8 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:text-[var(--foreground)] [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-[var(--foreground)] [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:text-[var(--foreground)] [&_img]:my-6 [&_img]:rounded-2xl [&_li]:mt-1 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_strong]:text-[var(--foreground)] [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              renderMarkdown(content)
            )}
          </div>

          <div className="mt-12 rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-8 text-center">
            <p className="font-serif text-[20px] font-semibold text-[var(--foreground)]">Bắt đầu hành trình ngủ tốt hơn</p>
            <p className="mt-2 text-[14px] text-[var(--muted)]">LUMIA đồng hành cùng bạn với AI lắng nghe, nhật ký cảm xúc và sản phẩm wellbeing.</p>
            <Link href="/register" className="mt-5 inline-flex rounded-full px-8 py-3 text-[14px] font-semibold text-white transition hover:opacity-90" style={{ background: "var(--green)" }}>
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { getBlogPost, BLOG_POSTS } from "@/data/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return { title: `${post.title} | LUMIA Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const paragraphs = (post.content ?? post.excerpt).split("\n\n").map((block, i) => {
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
            {paragraphs}
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

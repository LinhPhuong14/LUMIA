import { absoluteUrl } from "@/lib/seo";

/**
 * Structured data (JSON-LD) cho blog.
 *
 * Vì sao cần: trang blog render bằng HTML thường, Google phải tự đoán đâu là
 * tiêu đề, đâu là ngày đăng, đâu là mô tả. JSON-LD nói thẳng những thứ đó ra
 * dưới dạng máy đọc được, và đây là điều kiện để bài viết đủ tư cách hiện kèm
 * ngày đăng, breadcrumb và tên site trong kết quả tìm kiếm — thay vì chỉ một
 * dòng link trơ. Không có nó thì nội dung vẫn được index, nhưng mất hết phần
 * hiển thị mở rộng, tức mất phần lớn tỉ lệ click.
 */

const SITE_NAME = "LUMIA";
const LOGO_PATH = "/brand/lumia-logo-light.png";

export const BLOG_BASE_PATH = "/blog";

export type BlogPostingSeoInput = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
};

/** Publisher dùng chung cho mọi schema — Google đòi có ở BlogPosting. */
function publisher() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(LOGO_PATH),
    },
  };
}

/**
 * Chỉ nhận ngày hợp lệ. Ngày rác trong `datePublished` khiến Google bỏ nguyên
 * khối structured data chứ không chỉ bỏ riêng trường đó.
 */
function isoDate(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Schema cho một bài viết cụ thể (`/blog/[slug]`). */
export function buildBlogPostingSchema(post: BlogPostingSeoInput) {
  const url = absoluteUrl(`${BLOG_BASE_PATH}/${post.slug}`);
  const datePublished = isoDate(post.publishedAt);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    // `mainEntityOfPage` chốt bản chính tắc của bài viết, để bản in/bản chia sẻ
    // không bị coi là trùng nội dung.
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(datePublished ? { datePublished } : {}),
    dateModified: isoDate(post.updatedAt) ?? datePublished,
    ...(post.category ? { articleSection: post.category } : {}),
    ...(post.coverImageUrl ? { image: [post.coverImageUrl] } : {}),
    inLanguage: "vi-VN",
    author: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: publisher(),
  };
}

/** Schema cho trang danh sách (`/blog`), kèm các bài đang hiển thị. */
export function buildBlogListingSchema(posts: { slug: string; title: string; publishedAt: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Blog ${SITE_NAME}`,
    description:
      "Kiến thức về giấc ngủ, thiền định và sức khỏe tinh thần từ đội ngũ LUMIA.",
    url: absoluteUrl(BLOG_BASE_PATH),
    inLanguage: "vi-VN",
    publisher: publisher(),
    blogPost: posts.map((post) => {
      const datePublished = isoDate(post.publishedAt);
      return {
        "@type": "BlogPosting",
        headline: post.title,
        url: absoluteUrl(`${BLOG_BASE_PATH}/${post.slug}`),
        ...(datePublished ? { datePublished } : {}),
      };
    }),
  };
}

/**
 * Breadcrumb. Đây là thứ đổi dòng URL xanh lét trong kết quả tìm kiếm thành
 * "lumia.com.vn › Blog › Khoa học giấc ngủ" — dễ đọc hơn và cho người tìm biết
 * bài viết nằm ở đâu trước khi họ bấm vào.
 */
export function buildBreadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

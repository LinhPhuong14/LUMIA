import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  BLOG_BASE_PATH,
  buildBlogListingSchema,
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/blog-seo";

const SITE = "https://lumia.com.vn";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = SITE;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

const POST = {
  slug: "giac-ngu-va-cam-xuc",
  title: "Giấc ngủ và cảm xúc",
  excerpt: "Một đêm ngủ kém làm phản ứng cảm xúc tăng mạnh.",
  publishedAt: "2026-06-01",
  updatedAt: "2026-06-20",
  category: "Khoa học giấc ngủ",
  coverImageUrl: `${SITE}/blog-images/cover.jpg`,
};

describe("buildBlogPostingSchema", () => {
  it("khai báo đúng loại và URL tuyệt đối của bài viết", () => {
    const schema = buildBlogPostingSchema(POST);
    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.url).toBe(`${SITE}${BLOG_BASE_PATH}/${POST.slug}`);
  });

  it("mainEntityOfPage trỏ về chính URL bài viết", () => {
    const schema = buildBlogPostingSchema(POST);
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": `${SITE}${BLOG_BASE_PATH}/${POST.slug}`,
    });
  });

  it("ngày đăng và ngày sửa đều ở dạng ISO", () => {
    const schema = buildBlogPostingSchema(POST);
    expect(schema.datePublished).toBe(new Date("2026-06-01").toISOString());
    expect(schema.dateModified).toBe(new Date("2026-06-20").toISOString());
  });

  it("thiếu ngày sửa thì lấy ngày đăng, không để trống", () => {
    const schema = buildBlogPostingSchema({ ...POST, updatedAt: null });
    expect(schema.dateModified).toBe(schema.datePublished);
  });

  it("bỏ hẳn trường ngày khi giá trị không parse được, thay vì gắn Invalid Date", () => {
    const schema = buildBlogPostingSchema({ ...POST, publishedAt: "không-phải-ngày", updatedAt: null });
    expect(schema).not.toHaveProperty("datePublished");
    expect(schema.dateModified).toBeUndefined();
  });

  it("không có ảnh bìa thì bỏ trường image chứ không gửi null", () => {
    const schema = buildBlogPostingSchema({ ...POST, coverImageUrl: null });
    expect(schema).not.toHaveProperty("image");
  });

  it("có ảnh bìa thì image là mảng — đúng dạng Google đọc", () => {
    const schema = buildBlogPostingSchema(POST);
    expect(schema.image).toEqual([POST.coverImageUrl]);
  });

  it("luôn kèm publisher có logo", () => {
    const schema = buildBlogPostingSchema(POST);
    expect(schema.publisher.name).toBe("LUMIA");
    expect(schema.publisher.logo.url.startsWith(SITE)).toBe(true);
  });
});

describe("buildBlogListingSchema", () => {
  it("liệt kê mọi bài với URL tuyệt đối", () => {
    const schema = buildBlogListingSchema([
      { slug: "a", title: "Bài A", publishedAt: "2026-06-01" },
      { slug: "b", title: "Bài B", publishedAt: "2026-05-01" },
    ]);
    expect(schema["@type"]).toBe("Blog");
    expect(schema.blogPost).toHaveLength(2);
    expect(schema.blogPost[0].url).toBe(`${SITE}${BLOG_BASE_PATH}/a`);
  });

  it("blog rỗng vẫn ra schema hợp lệ, không nổ", () => {
    const schema = buildBlogListingSchema([]);
    expect(schema.blogPost).toEqual([]);
    expect(schema.url).toBe(`${SITE}${BLOG_BASE_PATH}`);
  });
});

describe("buildBreadcrumbSchema", () => {
  it("đánh số vị trí từ 1 theo đúng thứ tự đường dẫn", () => {
    const schema = buildBreadcrumbSchema([
      { name: "Trang chủ", path: "/" },
      { name: "Blog", path: BLOG_BASE_PATH },
      { name: "Bài viết", path: `${BLOG_BASE_PATH}/abc` },
    ]);

    expect(schema.itemListElement.map((c) => c.position)).toEqual([1, 2, 3]);
    expect(schema.itemListElement[0].item).toBe(`${SITE}/`);
    expect(schema.itemListElement[2].item).toBe(`${SITE}${BLOG_BASE_PATH}/abc`);
  });
});

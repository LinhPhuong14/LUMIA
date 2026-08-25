import { describe, expect, it } from "vitest";

import { BLOG_POSTS } from "@/data/blog-posts";
import { MAX_BLOG_LIMIT, parseBlogLimit, sortedStaticPosts } from "@/lib/blog-query";

describe("parseBlogLimit", () => {
  it("nhận số hợp lệ", () => {
    expect(parseBlogLimit("3")).toBe(3);
    expect(parseBlogLimit("1")).toBe(1);
  });

  it("thiếu tham số thì dùng mặc định", () => {
    expect(parseBlogLimit(null)).toBe(MAX_BLOG_LIMIT);
    expect(parseBlogLimit("")).toBe(MAX_BLOG_LIMIT);
  });

  it("giá trị rác không lọt xuống thành NaN", () => {
    // `.limit(NaN)` là truy vấn hỏng gửi thẳng tới Supabase.
    for (const raw of ["abc", "3.5.1", "Infinity", "-Infinity"]) {
      expect(Number.isFinite(parseBlogLimit(raw))).toBe(true);
    }
  });

  it("số âm và số 0 rơi về mặc định", () => {
    expect(parseBlogLimit("0")).toBe(MAX_BLOG_LIMIT);
    expect(parseBlogLimit("-5")).toBe(MAX_BLOG_LIMIT);
  });

  it("chặn trên để không kéo cả bảng về", () => {
    expect(parseBlogLimit("9999")).toBe(MAX_BLOG_LIMIT);
  });

  it("số thập phân bị cắt xuống số nguyên", () => {
    expect(parseBlogLimit("3.9")).toBe(3);
  });
});

describe("sortedStaticPosts", () => {
  it("trả về mới nhất trước", () => {
    const dates = sortedStaticPosts().map((p) => p.publishedAt);
    const descending = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(descending);
  });

  it("thực sự đảo thứ tự của BLOG_POSTS chứ không trả về nguyên trạng", () => {
    // File dữ liệu xếp theo ngày tăng dần; nếu hàm này quên sắp xếp thì bài
    // "Mới nhất" trên trang blog lại là bài cũ nhất.
    expect(sortedStaticPosts()[0].slug).not.toBe(BLOG_POSTS[0].slug);
    expect(sortedStaticPosts()[0].slug).toBe(BLOG_POSTS[BLOG_POSTS.length - 1].slug);
  });

  it("cắt đúng số lượng khi có limit", () => {
    expect(sortedStaticPosts(2)).toHaveLength(2);
    expect(sortedStaticPosts(2)[0].slug).toBe(sortedStaticPosts()[0].slug);
  });

  it("không có limit thì trả đủ bài", () => {
    expect(sortedStaticPosts()).toHaveLength(BLOG_POSTS.length);
  });

  it("không làm biến đổi mảng gốc", () => {
    const before = BLOG_POSTS.map((p) => p.slug);
    sortedStaticPosts();
    expect(BLOG_POSTS.map((p) => p.slug)).toEqual(before);
  });
});

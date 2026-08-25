import { BLOG_POSTS, type BlogPost } from "@/data/blog-posts";

/**
 * Chỗ dùng chung cho việc đọc bài blog.
 *
 * Trước đây mỗi nơi đọc blog (trang danh sách, khối trang chủ, API) tự sắp xếp
 * lấy dữ liệu tĩnh một kiểu, và một trong số đó quên sắp xếp hẳn — khiến khối
 * "Mới nhất" hiện đúng bài cũ nhất. Gom về một chỗ để ba nơi không thể lệch
 * nhau lần nữa.
 */

/** Chặn trên cho `?limit=`, để một tham số bịa không kéo được cả bảng về. */
export const MAX_BLOG_LIMIT = 50;

/**
 * Đọc `?limit=` từ query string.
 *
 * Giá trị rác (`abc`, rỗng, số âm) phải trả về mặc định chứ không được lọt
 * xuống thành `NaN`: `.limit(NaN)` là một truy vấn hỏng gửi thẳng tới Supabase.
 */
export function parseBlogLimit(raw: string | null): number {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return MAX_BLOG_LIMIT;
  }
  return Math.min(Math.floor(parsed), MAX_BLOG_LIMIT);
}

/**
 * Bài seed tĩnh, mới nhất trước.
 *
 * `BLOG_POSTS` trong file dữ liệu nằm theo thứ tự ngày TĂNG dần, còn mọi truy
 * vấn DB đều trả về giảm dần — nên nhánh tĩnh bắt buộc phải tự đảo lại thì hai
 * nhánh mới nói cùng một điều.
 */
export function sortedStaticPosts(limit?: number): BlogPost[] {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

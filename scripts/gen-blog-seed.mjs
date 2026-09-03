/**
 * Sinh `supabase/seeds/004_blog_posts.sql` từ `src/data/blog-posts.ts`.
 *
 * Chạy:  node --experimental-strip-types scripts/gen-blog-seed.mjs > supabase/seeds/004_blog_posts.sql
 *
 * Chép tay 5.000 ký tự tiếng Việt sang SQL là cách chắc chắn để lọt lỗi dấu
 * và lỗi escape, nên file SQL được sinh ra chứ không viết tay. Sửa nội dung ở
 * `blog-posts.ts` rồi chạy lại lệnh trên.
 */

import { BLOG_POSTS } from "../src/data/blog-posts.ts";

const TAG = "lumia_seed";           // tag dollar-quote, tránh phải escape dấu nháy
const open = `$${TAG}$`;

// Không được để nội dung chứa đúng chuỗi dollar-quote, nếu không SQL đứt giữa chừng.
for (const p of BLOG_POSTS) {
  for (const [field, value] of Object.entries(p)) {
    if (typeof value === "string" && value.includes(open)) {
      throw new Error(`Bài ${p.slug} có chuỗi ${open} trong trường ${field} — đổi tag dollar-quote.`);
    }
  }
}

const q = (s) => `${open}${s}${open}`;

const rows = [...BLOG_POSTS]
  .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
  .map((p) => `  (
    ${q(p.slug)},
    ${q(p.title)},
    ${q(p.excerpt)},
    ${q(p.content ?? p.excerpt)},
    ${q(p.category)},
    ${q(p.emoji)},
    ${q(p.coverColor)},
    ${p.readTime},
    true,
    ${q(p.publishedAt)}::timestamptz
  )`)
  .join(",\n");

const sql = `-- Seed: nạp ${BLOG_POSTS.length} bài blog khởi điểm vào bảng blog_posts.
--
-- Sinh tự động từ src/data/blog-posts.ts — đừng sửa tay file này, sửa file
-- nguồn rồi chạy lại script sinh.
--
-- Vì sao cần nạp: cho tới khi bảng có bài publish, mọi chỗ đọc blog (trang
-- danh sách, khối trang chủ, widget dashboard, sitemap) đều rơi về ${BLOG_POSTS.length} bài tĩnh
-- trong code. Sitemap vì thế công bố ${BLOG_POSTS.length} URL đó cho Google. Đến lúc admin đăng
-- bài thật đầu tiên, DB thành nguồn sự thật duy nhất và ${BLOG_POSTS.length} URL kia lập tức 404
-- — tức là Google đang giữ ${BLOG_POSTS.length} đường dẫn hỏng. Nạp chúng vào DB ngay từ đầu thì
-- không bao giờ có bước hẫng đó, và admin sửa hay xoá được chúng như bài thường.
--
-- Chạy trong Supabase SQL Editor, SAU migration 033_blog_schema.sql.
-- An toàn khi chạy lại: ON CONFLICT DO NOTHING nên không ghi đè bài admin đã sửa.

INSERT INTO public.blog_posts
  (slug, title, excerpt, content, category, emoji, cover_color, read_time, published, published_at)
VALUES
${rows}
ON CONFLICT (slug) DO NOTHING;

-- Kiểm tra nhanh sau khi chạy.
SELECT count(*) AS so_bai_da_dang FROM public.blog_posts WHERE published = true;
`;

process.stdout.write(sql);

-- Dựng đủ schema cho blog: bảng, cột ảnh bìa, RLS và bucket ảnh.
--
-- File này làm nhiều hơn cái tên "thêm cột ảnh bìa" ban đầu, vì một lý do cụ
-- thể: migration 015 (tạo bảng `blog_posts`) chưa từng chạy trên DB thật, nên
-- lệnh ALTER TABLE thêm cột báo `42P01: relation "public.blog_posts" does not
-- exist`. Dự án không có công cụ chạy migration tự động — mọi file đều chạy tay
-- qua SQL editor — nên trạng thái DB có thể dừng ở bất kỳ đâu giữa chừng.
--
-- Vì vậy file này viết theo kiểu HỘI TỤ thay vì kiểu "một bước thay đổi": chạy
-- ở trạng thái nào, chạy lại bao nhiêu lần, kết quả cuối cũng như nhau. Không
-- cần biết trước 015 hay 018 đã chạy hay chưa. Chạy đúng file này là đủ.
--
-- Phụ thuộc: `public.is_admin()` và bảng `public.profiles`, đều có từ
-- 001_initial_schema.sql.

-- ── Bảng ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Wellbeing',
  emoji text NOT NULL DEFAULT '📝',
  cover_color text NOT NULL DEFAULT 'linear-gradient(135deg,#e0f2e9,#b8dfc8)',
  cover_image_url text,
  read_time int NOT NULL DEFAULT 3,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trường hợp bảng đã tồn tại từ 015: khi đó nó thiếu đúng cột này. Form admin
-- đã gửi `cover_image_url` lên từ lâu nhưng không có chỗ cất, nên ảnh bìa tải
-- lên nằm lại trong bucket rồi mất hút sau khi bấm Lưu.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_url text;

COMMENT ON COLUMN public.blog_posts.cover_image_url IS
  'URL công khai của ảnh bìa trong bucket blog-images. NULL thì trang blog rơi về nền gradient cover_color + emoji.';

-- ── RLS trên bảng ───────────────────────────────────────────────────────────

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- DROP trước CREATE ở mọi policy: Postgres không có `CREATE POLICY IF NOT
-- EXISTS`, nên đây là cách duy nhất để file chạy lại được lần thứ hai.
DROP POLICY IF EXISTS "Public read published posts" ON public.blog_posts;
CREATE POLICY "Public read published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- Dùng `public.is_admin()` thay vì viết thẳng `SELECT ... FROM profiles` vào
-- policy như bản 015. Hàm đó là SECURITY DEFINER nên bỏ qua RLS — chính là cách
-- migration 002 đã dùng để chữa lỗi đệ quy vô hạn khi một policy lại đi truy vấn
-- bảng `profiles` vốn cũng đang bật RLS.
DROP POLICY IF EXISTS "Admins full access" ON public.blog_posts;
CREATE POLICY "Admins full access"
  ON public.blog_posts FOR ALL
  USING (public.is_admin());

-- ── Bucket ảnh bìa ──────────────────────────────────────────────────────────
-- Lặp lại phần blog của migration 018 để file này đứng một mình được. Đã chạy
-- 018 rồi thì các lệnh dưới đây là vô hại.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;
CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.is_admin());

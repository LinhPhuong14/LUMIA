-- Ảnh bìa bài viết.
--
-- Form admin đã có nút tải ảnh bìa và gửi `cover_image_url` lên từ lâu, nhưng
-- cột này chưa bao giờ được tạo và API cũng không lưu — ảnh tải lên nằm lại
-- trong bucket rồi mất hút sau khi bấm Lưu. `blog-images` bucket đã có sẵn từ
-- migration 018, giờ chỉ thiếu chỗ cất URL.
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN public.blog_posts.cover_image_url IS
  'URL công khai của ảnh bìa trong bucket blog-images. NULL thì trang blog rơi về nền gradient cover_color + emoji.';

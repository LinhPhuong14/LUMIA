-- Migration 032: gán ảnh chuông thiền cho track audio — bản TỰ BÁO CÁO
--
-- Vì sao cần bản này: 031 chạy xong mà ảnh không đổi, và nó không nói gì cả.
-- Hai điều kiện của nó đều có thể khớp 0 dòng mà vẫn "chạy thành công":
--
--   1. `store_products.image_url` của 'chuong-thien' đang NULL. Seed ở migration
--      019 KHÔNG hề chèn image_url cho 6 sản phẩm mặc định — cột chỉ có giá trị
--      nếu admin đã tự tải ảnh lên trong /admin → Sản phẩm.
--   2. Tên track audio không chứa đúng chuỗi 'chuông thiền'.
--
-- File này làm cùng việc như 031 nhưng IN RA những gì nó thấy, nên chạy một lần
-- là biết vướng ở đâu thay vì phải đoán tiếp. Xem tab "Messages"/"Notices" của
-- Supabase SQL Editor sau khi chạy.
--
-- An toàn chạy lại nhiều lần.

DO $$
DECLARE
  v_product_image TEXT;
  v_updated       INT := 0;
  r               RECORD;
BEGIN
  -- ── 1. Sản phẩm cửa hàng có ảnh chưa? ────────────────────────────────────
  SELECT image_url INTO v_product_image
    FROM public.store_products
   WHERE slug = 'chuong-thien';

  IF NOT FOUND THEN
    RAISE NOTICE '[chuông] KHÔNG có sản phẩm slug = chuong-thien trong store_products.';
  ELSIF v_product_image IS NULL OR v_product_image = '' THEN
    RAISE NOTICE '[chuông] Sản phẩm chuong-thien TỒN TẠI nhưng CHƯA CÓ ẢNH (image_url rỗng).';
    RAISE NOTICE '[chuông] → Vào /admin → Sản phẩm → Chuông thiền → tải ảnh lên, rồi chạy lại file này.';
  ELSE
    RAISE NOTICE '[chuông] Ảnh sản phẩm: %', v_product_image;
  END IF;

  -- ── 2. Trong thư viện audio đang có những track nào nghe giống chuông? ───
  RAISE NOTICE '[chuông] Các track audio khớp từ khoá (chuông / chuong / bell):';
  FOR r IN
    SELECT title, category, COALESCE(thumbnail_url, '(chưa có ảnh)') AS thumb
      FROM public.audio_tracks
     WHERE lower(title) LIKE '%chuông%'
        OR lower(title) LIKE '%chuong%'
        OR lower(title) LIKE '%bell%'
     ORDER BY title
  LOOP
    RAISE NOTICE '    • "%" [%] — %', r.title, r.category, r.thumb;
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM public.audio_tracks
     WHERE lower(title) LIKE '%chuông%'
        OR lower(title) LIKE '%chuong%'
        OR lower(title) LIKE '%bell%'
  ) THEN
    RAISE NOTICE '    (không có track nào khớp — tên track chắc chắn khác, xem danh sách đầy đủ bên dưới)';
    RAISE NOTICE '[chuông] Toàn bộ track thuộc nhóm thiền:';
    FOR r IN
      SELECT title, category, COALESCE(thumbnail_url, '(chưa có ảnh)') AS thumb
        FROM public.audio_tracks
       WHERE category::text IN ('guided_meditation', 'mini_meditation', 'timer_ambient')
       ORDER BY category::text, title
    LOOP
      RAISE NOTICE '    • "%" [%] — %', r.title, r.category, r.thumb;
    END LOOP;
  END IF;

  -- ── 3. Gán ảnh, nếu có ảnh để gán ───────────────────────────────────────
  IF v_product_image IS NOT NULL AND v_product_image <> '' THEN
    UPDATE public.audio_tracks
       SET thumbnail_url = v_product_image
     WHERE (lower(title) LIKE '%chuông%'
            OR lower(title) LIKE '%chuong%'
            OR lower(title) LIKE '%bell%')
       AND thumbnail_url IS DISTINCT FROM v_product_image;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '[chuông] Đã cập nhật % track.', v_updated;

    IF v_updated = 0 THEN
      RAISE NOTICE '[chuông] 0 track được đổi — hoặc đã đúng ảnh từ trước, hoặc không track nào khớp từ khoá.';
    END IF;
  END IF;
END $$;

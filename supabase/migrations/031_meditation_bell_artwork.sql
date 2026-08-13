-- Migration 031: lấy ảnh "Chuông thiền" bên cửa hàng làm ảnh bìa cho track audio
-- cùng tên.
--
-- Track chuông thiền trong thư viện audio không có `thumbnail_url`, nên nó rơi
-- xuống ảnh nền chung theo thể loại — một tấm ảnh không liên quan gì tới chuông.
-- Sản phẩm `chuong-thien` bên cửa hàng đã có sẵn ảnh chụp đúng cái chuông đó,
-- dùng lại là khớp nhất và không phải tải ảnh mới lên.
--
-- Khớp theo tên chứ không theo id: track do admin tạo trên production nên id ở
-- đây không đoán được. `lower(...) LIKE` để không phụ thuộc hoa/thường hay phần
-- chữ đứng trước/sau (vd "Chuông thiền 5 phút").
--
-- An toàn chạy lại: chạy lần nữa chỉ ghi lại đúng giá trị cũ.

UPDATE public.audio_tracks AS t
   SET thumbnail_url = p.image_url
  FROM public.store_products AS p
 WHERE p.slug = 'chuong-thien'
   AND p.image_url IS NOT NULL
   AND p.image_url <> ''
   AND lower(t.title) LIKE '%chuông thiền%'
   AND t.thumbnail_url IS DISTINCT FROM p.image_url;

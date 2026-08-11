-- Migration 027: phương thức thanh toán + huỷ đơn cho đơn cửa hàng
--
-- Trước đây đơn cửa hàng luôn nằm ở `pending_payment` và shop gọi điện xác nhận
-- thủ công — không chỗ nào ghi khách trả tiền kiểu gì, và khách không có đường
-- nào tự huỷ.
--
-- Hiện chỉ mở COD (trả tiền mặt khi nhận hàng), nên đơn mới vào thẳng
-- 'preparing': không có bước thanh toán online nào để chờ, để ở 'pending_payment'
-- chỉ tạo một hàng đợi giả không ai gỡ.
--
-- CHECK vẫn nhận 'payos' để sau này mở chuyển khoản không phải đổi schema, còn
-- API thì đang đóng, chỉ nhận 'cod'.
--
-- Mặc định 'cod' cho những đơn đã có: chúng được tạo bằng luồng cũ không hề gọi
-- PayOS và shop thu tiền lúc giao — đúng nghĩa COD.

ALTER TABLE public.store_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod';

ALTER TABLE public.store_orders
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'store_orders_payment_method_check'
  ) THEN
    ALTER TABLE public.store_orders
      ADD CONSTRAINT store_orders_payment_method_check
      CHECK (payment_method IN ('cod','payos'));
  END IF;
END $$;

-- Liệt kê đơn của một người trong trang "Đơn hàng của tôi".
CREATE INDEX IF NOT EXISTS store_orders_user_created_idx
  ON public.store_orders (user_id, created_at DESC);

-- Khách tự huỷ đơn: cố ý KHÔNG thêm policy UPDATE cho khách.
--
-- Một policy `USING (auth.uid() = user_id)` sẽ cho khách sửa mọi cột — kể cả
-- total_vnd, items, hay lật thẳng status sang 'delivered'. Ràng buộc thật sự là
-- "chỉ được đổi status sang 'cancelled', và chỉ khi đơn chưa rời kho", thứ RLS
-- diễn đạt rất vụng. Việc huỷ đi qua POST /api/store/orders/[id]/cancel bằng
-- service role, sau khi route đã tự kiểm tra chủ đơn và trạng thái.

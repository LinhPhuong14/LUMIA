-- Migration 028: tạo lại bảng feedback nếu chưa có
--
-- Migration 010 nằm ngay cạnh 011 — cái đã được xác nhận là KHÔNG BAO GIỜ chạy
-- trên production (xem 019/020 dựng lại store_products và store_orders). Không
-- có migration nào dựng lại 010, nên `feedback` nhiều khả năng cũng chưa tồn
-- tại, và mọi lượt gửi góp ý đều đổ vào một câu 500 chung không nói gì.
--
-- An toàn để chạy lại: IF NOT EXISTS / DO NOTHING ở mọi bước.

CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category    TEXT NOT NULL CHECK (category IN ('bug', 'feature', 'content', 'ux', 'other')),
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  message     TEXT NOT NULL,
  wishes      TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'feedback' AND policyname = 'Users can insert their own feedback'
  ) THEN
    CREATE POLICY "Users can insert their own feedback"
      ON public.feedback FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'feedback' AND policyname = 'Users can view their own feedback'
  ) THEN
    CREATE POLICY "Users can view their own feedback"
      ON public.feedback FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'feedback' AND policyname = 'Admins can view all feedback'
  ) THEN
    CREATE POLICY "Admins can view all feedback"
      ON public.feedback FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Danh sách "phản hồi đã gửi" của một người, mới nhất trước.
CREATE INDEX IF NOT EXISTS feedback_user_created_idx
  ON public.feedback (user_id, created_at DESC);

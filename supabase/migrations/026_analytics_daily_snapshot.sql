-- Migration 026: Lịch sử traffic theo ngày, đóng băng một lần.
--
-- GA4 không có dữ liệu hồi tố: những ngày trước khi gắn tag là mất vĩnh viễn.
-- Bảng này giữ đoạn lịch sử đó dưới dạng cố định để biểu đồ không bị đứt, và
-- cột `source` ghi rõ ngày nào là số đo được, ngày nào là số dựng lại.
--
-- Vì sao phải đóng băng thay vì sinh lại mỗi lần đọc: bộ sinh số mẫu neo theo
-- profile sớm nhất trong DB, nên chỉ cần xoá một user cũ là cả lịch sử dịch
-- chuyển. Chấp nhận được khi nó là placeholder, không chấp nhận được khi nó
-- đã thành lịch sử chính thức của báo cáo.

CREATE TABLE IF NOT EXISTS public.analytics_daily_snapshot (
  date                DATE PRIMARY KEY,
  -- 'demo'  = số dựng lại cho giai đoạn chưa gắn đo
  -- 'ga4'   = số thật lấy từ GA4 Data API
  source              TEXT NOT NULL CHECK (source IN ('demo', 'ga4')),
  users               INTEGER NOT NULL DEFAULT 0,
  new_users           INTEGER NOT NULL DEFAULT 0,
  sessions            INTEGER NOT NULL DEFAULT 0,
  page_views          INTEGER NOT NULL DEFAULT 0,
  engagement_rate     NUMERIC(6, 5) NOT NULL DEFAULT 0,
  avg_session_seconds NUMERIC(8, 2) NOT NULL DEFAULT 0,
  clicks              INTEGER NOT NULL DEFAULT 0,
  impressions         INTEGER NOT NULL DEFAULT 0,
  -- Hệ số đã dùng để neo đoạn 'demo' về đúng mức traffic thật. Giữ lại để về
  -- sau còn dựng lại được y hệt, hoặc để biết đoạn đó đã bị scale bao nhiêu.
  scale_factor        NUMERIC(10, 4),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_source
  ON public.analytics_daily_snapshot(source);

ALTER TABLE public.analytics_daily_snapshot ENABLE ROW LEVEL SECURITY;

-- Không có policy nào cho client: bảng này chỉ được đọc/ghi qua service role
-- trong các route /api/admin/*. RLS bật mà không policy = chặn sạch anon.

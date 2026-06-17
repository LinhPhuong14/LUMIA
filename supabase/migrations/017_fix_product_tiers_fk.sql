-- Migration 017: Bring production DB up to date
-- Covers missing migrations 006 + 007 (product_tiers table + orders columns)
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT DO UPDATE)

-- ── 1. Create product_tiers table if missing ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_tiers (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  duration_months   INTEGER NOT NULL DEFAULT 1,
  price_vnd         INTEGER NOT NULL,
  has_physical_box  BOOLEAN NOT NULL DEFAULT false,
  physical_box_type TEXT,
  box_contents      TEXT[] NOT NULL DEFAULT '{}',
  features          TEXT[] NOT NULL DEFAULT '{}',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_first_time_only BOOLEAN NOT NULL DEFAULT false,
  discount_percent  INTEGER NOT NULL DEFAULT 0,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Upsert all current tiers ──────────────────────────────────────────────
INSERT INTO public.product_tiers (
  id, name, slug, duration_months, price_vnd, has_physical_box, physical_box_type,
  box_contents, features, is_featured, is_first_time_only, discount_percent, sort_order
) VALUES
  (
    'first_time', 'LUMIA FIRST-TIME USER', 'first-time-user',
    1, 99000, true, 'mini_wellcome',
    ARRAY['1 Hộp trà thảo mộc', '1 Xịt gối mini'],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Welcome Kit: trà thảo mộc + xịt gối mini'],
    false, true, 0, 0
  ),
  (
    'standard', 'LUMIA STANDARD', 'standard',
    1, 129000, false, null,
    ARRAY[]::text[],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn'],
    false, false, 0, 1
  ),
  (
    'plus', 'LUMIA PLUS', 'plus',
    3, 349000, false, null,
    ARRAY[]::text[],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Gia hạn tự động'],
    true, false, 10, 2
  ),
  (
    'pro', 'LUMIA PRO', 'pro',
    6, 599000, false, null,
    ARRAY[]::text[],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Phân tích dữ liệu chuyên sâu dài hạn'],
    false, false, 22, 3
  ),
  (
    'premium', 'LUMIA PREMIUM', 'premium',
    3, 699000, true, 'sleep_box',
    ARRAY['1 Hũ nến thơm', '1 Hộp trà thảo mộc', '1 Bịt mắt lụa'],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Tặng kèm đặc quyền Sleep Box'],
    false, false, 15, 4
  ),
  (
    'ultimate', 'LUMIA ULTIMATE', 'ultimate',
    6, 1199000, true, 'master_box',
    ARRAY['1 Hũ nến thơm', '1 Hộp trà thảo mộc', '1 Bịt mắt lụa', '1 Bộ tinh dầu', '1 Xịt gối'],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Tặng kèm đặc quyền Master Box'],
    false, false, 20, 5
  )
ON CONFLICT (id) DO UPDATE SET
  name              = EXCLUDED.name,
  slug              = EXCLUDED.slug,
  duration_months   = EXCLUDED.duration_months,
  price_vnd         = EXCLUDED.price_vnd,
  has_physical_box  = EXCLUDED.has_physical_box,
  physical_box_type = EXCLUDED.physical_box_type,
  box_contents      = EXCLUDED.box_contents,
  features          = EXCLUDED.features,
  is_featured       = EXCLUDED.is_featured,
  discount_percent  = EXCLUDED.discount_percent,
  sort_order        = EXCLUDED.sort_order;

-- RLS for product_tiers
ALTER TABLE public.product_tiers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'product_tiers' AND policyname = 'Anyone can read product tiers'
  ) THEN
    CREATE POLICY "Anyone can read product tiers" ON public.product_tiers FOR SELECT USING (true);
  END IF;
END $$;

-- ── 3. Add missing columns to orders (safe, idempotent) ──────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tier              TEXT,
  ADD COLUMN IF NOT EXISTS duration_months   INTEGER,
  ADD COLUMN IF NOT EXISTS has_physical_box  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS physical_box_type TEXT,
  ADD COLUMN IF NOT EXISTS shipping_name     TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone    TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address  TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city     TEXT,
  ADD COLUMN IF NOT EXISTS shipping_note     TEXT;

-- ── 4. Migrate legacy tier names in orders (if any) ──────────────────────────
UPDATE public.orders SET tier = 'plus'     WHERE tier = 'saver';
UPDATE public.orders SET tier = 'premium'  WHERE tier = 'sleep_well';
UPDATE public.orders SET tier = 'ultimate' WHERE tier = 'master';
UPDATE public.orders SET physical_box_type = 'sleep_box'  WHERE physical_box_type IN ('sleep_well', 'sleep-well');
UPDATE public.orders SET physical_box_type = 'master_box' WHERE physical_box_type IN ('master', 'sleep-master');

-- ── 5. Add missing column to subscriptions ───────────────────────────────────
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier TEXT;

UPDATE public.subscriptions SET tier = 'plus'     WHERE tier = 'saver';
UPDATE public.subscriptions SET tier = 'premium'  WHERE tier = 'sleep_well';
UPDATE public.subscriptions SET tier = 'ultimate' WHERE tier = 'master';

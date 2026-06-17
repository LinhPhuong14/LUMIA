-- Migration 019: Create store_products table if missing + seed 6 default products
-- Migration 011 was never applied on production. Safe to re-run (IF NOT EXISTS / ON CONFLICT).

CREATE TABLE IF NOT EXISTS public.store_products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  price_vnd     INTEGER NOT NULL,
  category      TEXT NOT NULL DEFAULT 'wellness',
  features      TEXT[] NOT NULL DEFAULT '{}',
  image_url     TEXT,
  in_stock      BOOLEAN NOT NULL DEFAULT true,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_products' AND policyname='Anyone reads active store products') THEN
    CREATE POLICY "Anyone reads active store products"
      ON public.store_products FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_products' AND policyname='Admins manage store products') THEN
    CREATE POLICY "Admins manage store products"
      ON public.store_products FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Add stock_quantity in case table already existed without it (migration 018)
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0;

-- Seed 6 default products
INSERT INTO public.store_products (slug, name, subtitle, description, price_vnd, category, features, stock_quantity, sort_order)
VALUES
  ('tra-thao-moc',    'Trà thảo mộc',         'Hộp 20 túi lọc',            'Hỗn hợp thảo mộc tự nhiên giúp thư giãn và chuẩn bị cho giấc ngủ sâu.',                          120000, 'drink',      ARRAY['Thư giãn tinh thần','Hỗ trợ ngủ sâu','Giảm căng thẳng'], 50, 1),
  ('nen-thom',        'Nến thơm',             'Hũ 270g · Đốt 30–40 tiếng', 'Nến sáp tự nhiên hương nhẹ nhàng, tạo không gian ấm áp cho buổi tối.',                           265000, 'scent',      ARRAY['Thư giãn','Giảm căng thẳng'], 30, 2),
  ('set-khuech-tan-tinh-dau', 'Set khuếch tán tinh dầu', 'Lavender, Bergamot, Lemon', 'Bộ khuếch tán tinh dầu 3 hương giúp tạo không gian ngủ lý tưởng.',                    100000, 'scent',      ARRAY['Thư giãn','Khử mùi','Tạo không gian ngủ'], 40, 3),
  ('xit-goi-ngu',     'Xịt gối ngủ',          '50ml / chai',               'Xịt thơm gối với tinh dầu thiên nhiên, giúp đi vào giấc ngủ dễ dàng hơn.',                       150000, 'scent',      ARRAY['Thư giãn tinh thần','Khử mùi','Xoa dịu tinh thần'], 60, 4),
  ('bit-mat-lua',     'Bịt mắt lụa',          'Lụa satin',                 'Bịt mắt làm từ lụa satin cao cấp, mềm mại, che sáng hoàn toàn để ngủ sâu hơn.',                 165000, 'sleep',      ARRAY['Che sáng hiệu quả','Hỗ trợ ngủ sâu','Tối ưu trải nghiệm'], 45, 5),
  ('chuong-thien',    'Chuông thiền',         'Chuông đồng, vỗ gỗ, đệm lót', 'Chuông thiền đồng thủ công, âm thanh trong trẻo, hỗ trợ thiền định và thư giãn sâu.',          330000, 'meditation', ARRAY['Hỗ trợ thiền định','Tối ưu trải nghiệm'], 20, 6)
ON CONFLICT (slug) DO NOTHING;

-- Subscription model: 5 tiers, monthly duration (replaces 21-day journey)

CREATE TABLE public.product_tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  duration_months integer NOT NULL,
  price_vnd integer NOT NULL,
  has_physical_box boolean NOT NULL DEFAULT false,
  physical_box_type text,
  box_contents text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_first_time_only boolean NOT NULL DEFAULT false,
  discount_percent integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.product_tiers (
  id, name, slug, duration_months, price_vnd, has_physical_box, physical_box_type,
  box_contents, features, is_featured, is_first_time_only, discount_percent, sort_order
) VALUES
  (
    'first_time', 'LUMIA FIRST-TIME USER', 'first-time-user',
    1, 99000, true, 'mini_wellcome',
    ARRAY['1 Hộp trà thảo mộc', '1 Xịt gối mini'],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn'],
    false, true, 0, 1
  ),
  (
    'standard', 'LUMIA STANDARD', 'standard',
    1, 129000, false, null,
    ARRAY[]::text[],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Ưu đãi 10% khi mua lẻ sản phẩm vật lý trên Website'],
    false, false, 10, 2
  ),
  (
    'saver', 'LUMIA SAVER', 'saver',
    3, 349000, false, null,
    ARRAY[]::text[],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn', 'Ưu đãi 10% khi mua lẻ sản phẩm vật lý trên Website'],
    true, false, 10, 3
  ),
  (
    'sleep_well', 'LUMIA SLEEP WELL', 'sleep-well',
    3, 699000, true, 'sleep_well',
    ARRAY['1 Hũ nến thơm', '1 Hộp trà thảo mộc', '1 Bịt mắt lụa'],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn'],
    false, false, 0, 4
  ),
  (
    'master', 'LUMIA SLEEP MASTER', 'sleep-master',
    6, 1199000, true, 'master',
    ARRAY['1 Hũ nến thơm', '1 Hộp trà thảo mộc', '1 Bịt mắt lụa', '1 Bộ tinh dầu', '1 Xịt gối'],
    ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn'],
    false, false, 0, 5
  );

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS tier text REFERENCES public.product_tiers(id),
  ADD COLUMN IF NOT EXISTS duration_months integer,
  ADD COLUMN IF NOT EXISTS has_physical_box boolean NOT NULL DEFAULT false;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tier text REFERENCES public.product_tiers(id),
  ADD COLUMN IF NOT EXISTS duration_months integer,
  ADD COLUMN IF NOT EXISTS has_physical_box boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS physical_box_type text;

-- Public read for product catalog
ALTER TABLE public.product_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read product tiers" ON public.product_tiers FOR SELECT USING (true);

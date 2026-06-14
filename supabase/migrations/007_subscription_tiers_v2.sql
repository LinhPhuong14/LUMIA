-- Subscription tiers v2: rename SAVER→PLUS, add PRO, rename SLEEP WELL→PREMIUM, SLEEP MASTER→ULTIMATE
-- Also add shipping address columns for physical box orders

-- Migrate existing tier references in orders/subscriptions
UPDATE public.orders SET tier = 'plus' WHERE tier = 'saver';
UPDATE public.orders SET tier = 'premium' WHERE tier = 'sleep_well';
UPDATE public.orders SET tier = 'ultimate' WHERE tier = 'master';

UPDATE public.subscriptions SET tier = 'plus' WHERE tier = 'saver';
UPDATE public.subscriptions SET tier = 'premium' WHERE tier = 'sleep_well';
UPDATE public.subscriptions SET tier = 'ultimate' WHERE tier = 'master';

-- Update physical_box_type naming
UPDATE public.orders SET physical_box_type = 'sleep_box' WHERE physical_box_type = 'sleep_well';
UPDATE public.orders SET physical_box_type = 'master_box' WHERE physical_box_type = 'master';

-- Remove old tiers and insert updated catalog
DELETE FROM public.product_tiers WHERE id IN ('saver', 'sleep_well', 'master');

INSERT INTO public.product_tiers (
  id, name, slug, duration_months, price_vnd, has_physical_box, physical_box_type,
  box_contents, features, is_featured, is_first_time_only, discount_percent, sort_order
) VALUES
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
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  duration_months = EXCLUDED.duration_months,
  price_vnd = EXCLUDED.price_vnd,
  has_physical_box = EXCLUDED.has_physical_box,
  physical_box_type = EXCLUDED.physical_box_type,
  box_contents = EXCLUDED.box_contents,
  features = EXCLUDED.features,
  is_featured = EXCLUDED.is_featured,
  discount_percent = EXCLUDED.discount_percent,
  sort_order = EXCLUDED.sort_order;

UPDATE public.product_tiers SET
  features = ARRAY['Truy cập toàn bộ tính năng Premium', 'AI cá nhân hóa không giới hạn'],
  discount_percent = 0
WHERE id = 'standard';

-- Shipping address for physical box fulfillment
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_name text,
  ADD COLUMN IF NOT EXISTS shipping_phone text,
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_note text;

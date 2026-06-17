-- Fix: ensure new product tier IDs exist before updating FK references.
-- Migration 007 may have partially failed because it tried to UPDATE orders.tier
-- to 'plus' before 'plus' existed in product_tiers (FK violation).

-- Step 1: Upsert all current tiers first (safe to re-run)
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
  name       = EXCLUDED.name,
  slug       = EXCLUDED.slug,
  price_vnd  = EXCLUDED.price_vnd,
  is_featured = EXCLUDED.is_featured,
  discount_percent = EXCLUDED.discount_percent,
  sort_order = EXCLUDED.sort_order;

-- Step 2: Now that new tiers exist, migrate old FK references in orders
UPDATE public.orders SET tier = 'plus'    WHERE tier = 'saver';
UPDATE public.orders SET tier = 'premium' WHERE tier = 'sleep_well';
UPDATE public.orders SET tier = 'ultimate' WHERE tier = 'master';

-- Step 3: Migrate subscriptions too
UPDATE public.subscriptions SET tier = 'plus'    WHERE tier = 'saver';
UPDATE public.subscriptions SET tier = 'premium' WHERE tier = 'sleep_well';
UPDATE public.subscriptions SET tier = 'ultimate' WHERE tier = 'master';

-- Step 4: Fix physical_box_type naming if still using old values
UPDATE public.orders SET physical_box_type = 'sleep_box'  WHERE physical_box_type IN ('sleep_well', 'sleep-well');
UPDATE public.orders SET physical_box_type = 'master_box' WHERE physical_box_type IN ('master', 'sleep-master');

-- Step 5: Remove legacy tier rows (now safe since FK refs have been updated)
DELETE FROM public.product_tiers WHERE id IN ('saver', 'sleep_well', 'master');

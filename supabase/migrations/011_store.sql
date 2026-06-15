-- Physical store: products, cart, store orders

-- Product catalog for physical store
CREATE TABLE IF NOT EXISTS public.store_products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  subtitle    TEXT,                        -- "Hộp 20 túi lọc", "Hũ 270g · Đốt 30-40 tiếng"
  description TEXT,
  price_vnd   INTEGER NOT NULL,
  category    TEXT NOT NULL DEFAULT 'wellness',
  features    TEXT[] NOT NULL DEFAULT '{}', -- bullet list
  image_url   TEXT,
  in_stock    BOOLEAN NOT NULL DEFAULT true,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active store products"
  ON public.store_products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage store products"
  ON public.store_products FOR ALL USING (public.is_admin());

-- Store orders (separate from subscription box orders)
CREATE TABLE IF NOT EXISTS public.store_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email     TEXT,                   -- for guest checkout
  status          TEXT NOT NULL DEFAULT 'pending_payment'
                    CHECK (status IN ('pending_payment','paid','preparing','shipping','delivered','cancelled')),
  items           JSONB NOT NULL,         -- [{product_id, slug, name, price_vnd, qty}]
  subtotal_vnd    INTEGER NOT NULL,
  shipping_vnd    INTEGER NOT NULL DEFAULT 0,
  total_vnd       INTEGER NOT NULL,
  shipping_name   TEXT,
  shipping_phone  TEXT,
  shipping_address TEXT,
  payos_order_id  TEXT UNIQUE,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own store orders"
  ON public.store_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert store orders"
  ON public.store_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage store orders"
  ON public.store_orders FOR ALL USING (public.is_admin());

CREATE TRIGGER store_orders_updated_at
  BEFORE UPDATE ON public.store_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed: 6 physical products
INSERT INTO public.store_products (slug, name, subtitle, description, price_vnd, category, features, sort_order)
VALUES
  (
    'tra-thao-moc',
    'Trà thảo mộc',
    'Hộp 20 túi lọc',
    'Hỗn hợp thảo mộc tự nhiên được chọn lọc để giúp bạn thư giãn và chuẩn bị cho giấc ngủ sâu.',
    120000,
    'drink',
    ARRAY['Thư giãn tinh thần', 'Hỗ trợ ngủ sâu', 'Giảm căng thẳng'],
    1
  ),
  (
    'nen-thom',
    'Nến thơm',
    'Hũ 270g · Đốt 30–40 tiếng',
    'Nến sáp tự nhiên với hương thơm nhẹ nhàng, tạo không gian ấm áp và thư giãn cho buổi tối.',
    265000,
    'scent',
    ARRAY['Thư giãn', 'Giảm căng thẳng'],
    2
  ),
  (
    'set-khuech-tan-tinh-dau',
    'Set khuếch tán tinh dầu',
    'Lavender, Bergamot, Lemon',
    'Bộ khuếch tán tinh dầu 3 hương giúp tạo không gian ngủ lý tưởng và thanh lọc không khí.',
    100000,
    'scent',
    ARRAY['Thư giãn', 'Khử mùi', 'Tạo không gian ngủ'],
    3
  ),
  (
    'xit-goi-ngu',
    'Xịt gối ngủ',
    '50ml / chai',
    'Xịt thơm gối với tinh dầu thiên nhiên, giúp bạn thư giãn và đi vào giấc ngủ dễ dàng hơn.',
    150000,
    'scent',
    ARRAY['Thư giãn tinh thần', 'Khử mùi', 'Xoa dịu tinh thần'],
    4
  ),
  (
    'bit-mat-lua',
    'Bịt mắt lụa',
    'Lụa satin',
    'Bịt mắt làm từ lụa satin cao cấp, mềm mại và thoáng khí, giúp che sáng hoàn toàn để ngủ sâu hơn.',
    165000,
    'sleep',
    ARRAY['Che sáng hiệu quả', 'Hỗ trợ ngủ sâu', 'Tối ưu trải nghiệm'],
    5
  ),
  (
    'chuong-thien',
    'Chuông thiền',
    'Chuông đồng, vỗ gỗ, đệm lót',
    'Chuông thiền đồng thủ công với âm thanh trong trẻo, hỗ trợ thiền định và tạo trạng thái thư giãn sâu.',
    330000,
    'meditation',
    ARRAY['Hỗ trợ thiền định', 'Tối ưu trải nghiệm'],
    6
  )
ON CONFLICT (slug) DO NOTHING;

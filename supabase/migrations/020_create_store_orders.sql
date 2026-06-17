-- Migration 020: Create store_orders table if missing
-- Migration 011 was never applied on production. Safe to re-run (IF NOT EXISTS / DO NOTHING).

CREATE TABLE IF NOT EXISTS public.store_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending_payment'
                     CHECK (status IN ('pending_payment','paid','preparing','shipping','delivered','cancelled')),
  items            JSONB NOT NULL,
  subtotal_vnd     INTEGER NOT NULL,
  shipping_vnd     INTEGER NOT NULL DEFAULT 0,
  total_vnd        INTEGER NOT NULL,
  shipping_name    TEXT,
  shipping_phone   TEXT,
  shipping_address TEXT,
  payos_order_id   TEXT UNIQUE,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_orders' AND policyname='Users read own store orders') THEN
    CREATE POLICY "Users read own store orders"
      ON public.store_orders FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_orders' AND policyname='Anyone can insert store orders') THEN
    CREATE POLICY "Anyone can insert store orders"
      ON public.store_orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='store_orders' AND policyname='Admins manage store orders') THEN
    CREATE POLICY "Admins manage store orders"
      ON public.store_orders FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Trigger for updated_at (set_updated_at function must exist from migration 001)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'store_orders_updated_at'
      AND tgrelid = 'public.store_orders'::regclass
  ) THEN
    CREATE TRIGGER store_orders_updated_at
      BEFORE UPDATE ON public.store_orders
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

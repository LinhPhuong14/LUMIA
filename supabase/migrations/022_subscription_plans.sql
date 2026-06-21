-- Migration 022: subscription_plans table for admin-managed plans
-- Falls back to product-tiers.ts if table is empty

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id            TEXT PRIMARY KEY, -- tier code: standard, plus, pro, premium, ultimate, first_time
  name          TEXT NOT NULL,
  description   TEXT,
  group_name    TEXT NOT NULL DEFAULT 'digital', -- promo | digital | hybrid
  price_vnd     INTEGER NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  has_physical_box BOOLEAN NOT NULL DEFAULT false,
  physical_box_type TEXT,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  is_first_time_only BOOLEAN NOT NULL DEFAULT false,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  features      TEXT[] NOT NULL DEFAULT '{}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_plans' AND policyname='Anyone reads active plans') THEN
    CREATE POLICY "Anyone reads active plans"
      ON public.subscription_plans FOR SELECT USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscription_plans' AND policyname='Admins manage plans') THEN
    CREATE POLICY "Admins manage plans"
      ON public.subscription_plans FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Seed from hardcoded tiers so admin can start editing immediately
INSERT INTO public.subscription_plans (id, name, group_name, price_vnd, duration_months, has_physical_box, physical_box_type, discount_percent, is_featured, is_first_time_only, sort_order)
VALUES
  ('first_time', 'LUMIA FIRST-TIME USER', 'promo',   99000,  1, true,  'mini_wellcome', 0,  false, true,  0),
  ('standard',   'LUMIA STANDARD',        'digital', 129000, 1, false, null,            0,  false, false, 1),
  ('plus',       'LUMIA PLUS',            'digital', 349000, 3, false, null,            10, false, false, 2),
  ('pro',        'LUMIA PRO',             'digital', 599000, 6, false, null,            22, true,  false, 3),
  ('premium',    'LUMIA PREMIUM',         'hybrid',  699000, 3, true,  'sleep_box',     0,  false, false, 4),
  ('ultimate',   'LUMIA ULTIMATE',        'hybrid',  1199000,6, true,  'master_box',    22, false, false, 5)
ON CONFLICT (id) DO NOTHING;

-- Seed: upgrade hello@lumia.com to admin + active SAVER subscription
-- Run in Supabase SQL Editor
-- Note: Run AFTER migration 009 (which adds nickname column) is applied.

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'hello@lumia.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User hello@lumia.com not found — create the account first, then re-run.';
    RETURN;
  END IF;

  -- Upsert profile: set admin role
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (v_user_id, 'hello@lumia.com', 'LUMIA Test', 'admin')
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin';

  -- Upsert subscription: active SAVER, 3 months
  INSERT INTO public.subscriptions (user_id, status, tier, duration_months, has_physical_box, started_at, expires_at)
  VALUES (v_user_id, 'active', 'saver', 3, false, NOW(), NOW() + INTERVAL '3 months')
  ON CONFLICT (user_id) DO UPDATE
    SET status          = 'active',
        tier            = 'saver',
        duration_months = 3,
        has_physical_box = false,
        started_at      = NOW(),
        expires_at      = NOW() + INTERVAL '3 months';

  RAISE NOTICE 'Done — hello@lumia.com is now admin + active SAVER (3 months). user_id = %', v_user_id;
END $$;

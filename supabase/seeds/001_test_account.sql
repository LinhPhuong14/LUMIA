-- Seed: upgrade hello@lumia.com to active Premium (LUMIA SAVER, 3 months)
-- Run this in Supabase SQL Editor or via `supabase db seed`

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Look up user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'hello@lumia.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User hello@lumia.com not found — skipping seed.';
    RETURN;
  END IF;

  -- Ensure profile exists with admin role + nickname
  INSERT INTO public.profiles (id, full_name, role, nickname, onboarding_goal)
  VALUES (v_user_id, 'LUMIA Test', 'admin', 'Linh', 'sleep')
  ON CONFLICT (id) DO UPDATE
    SET role            = 'admin',
        nickname        = COALESCE(profiles.nickname, 'Linh'),
        onboarding_goal = COALESCE(profiles.onboarding_goal, 'sleep');

  -- Upsert active subscription (SAVER tier, 3 months from now)
  INSERT INTO public.subscriptions (
    user_id,
    status,
    tier,
    duration_months,
    has_physical_box,
    started_at,
    expires_at
  )
  VALUES (
    v_user_id,
    'active',
    'saver',
    3,
    false,
    NOW(),
    NOW() + INTERVAL '3 months'
  )
  ON CONFLICT (user_id) DO UPDATE
    SET status         = 'active',
        tier           = 'saver',
        duration_months = 3,
        has_physical_box = false,
        started_at     = NOW(),
        expires_at     = NOW() + INTERVAL '3 months';

  RAISE NOTICE 'hello@lumia.com upgraded to active SAVER subscription (expires in 3 months). user_id = %', v_user_id;
END $$;

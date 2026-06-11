-- Bootstrap profile/subscription/streak for authenticated users (no service role required).
-- Fixes POST /api/mood 500 when trigger missed or RLS blocks direct insert.

CREATE OR REPLACE FUNCTION public.ensure_my_profile(p_full_name text DEFAULT '')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT email INTO uemail FROM auth.users WHERE id = uid;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (uid, uemail, COALESCE(NULLIF(p_full_name, ''), ''), 'user')
  ON CONFLICT (id) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = uid LIMIT 1) THEN
    INSERT INTO public.subscriptions (user_id, status) VALUES (uid, 'free');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.streaks WHERE user_id = uid) THEN
    INSERT INTO public.streaks (user_id) VALUES (uid);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_my_profile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_my_profile(text) TO authenticated;

-- Mood upsert RLS (idempotent)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own mood checkins" ON public.mood_checkins;
CREATE POLICY "Users manage own mood checkins" ON public.mood_checkins
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Migration 025: Backfill onboarding for accounts stranded by the enum bug.
--
-- Until migration 024 every onboarding submission except 'sleep' was rejected by
-- the old ENUM, so ~3k long-time users still have onboarding_goal IS NULL and
-- would suddenly be pushed through onboarding on their next login. Mark them as
-- onboarded using what we already know about them; they can adjust everything
-- afterwards from Settings → "Thói quen cá nhân".
--
-- Run this AFTER 024, otherwise the 'peace' writes below fail against the enum.

UPDATE public.profiles p
SET
  -- Reuse a name we genuinely have rather than inventing one.
  nickname = COALESCE(
    NULLIF(btrim(p.nickname), ''),
    NULLIF(btrim(p.full_name), ''),
    NULLIF(split_part(COALESCE(p.email, ''), '@', 1), ''),
    'bạn'
  ),
  onboarding_goal = 'peace',
  onboarding_data = jsonb_build_object(
    'motivation', 'peace',
    'bedtime', '22_23',
    'sleepQuality', 3,
    -- The one field with a real signal behind it: their latest mood check-in.
    'recentMood', COALESCE((
      SELECT CASE
               WHEN mc.score >= 4 THEN 'balanced'
               WHEN mc.score = 3 THEN 'slightly_stressed'
               ELSE 'anxious'
             END
      FROM public.mood_checkins mc
      WHERE mc.user_id = p.id
      ORDER BY mc.date DESC
      LIMIT 1
    ), 'balanced'),
    'companionMode', 'digital',
    -- Lets the UI tell "user actually chose this" from "we guessed".
    'autofilled', true,
    'source', 'migration_025'
  )
WHERE p.onboarding_goal IS NULL;

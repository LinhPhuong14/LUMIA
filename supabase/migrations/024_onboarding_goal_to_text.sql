-- Migration 024: Convert profiles.onboarding_goal from ENUM to TEXT
--
-- Migration 001 created onboarding_goal as ENUM ('sleep','stress','meditation'),
-- but the onboarding UI now submits 'peace' | 'sleep' | 'habit' | 'self_care' | 'sharing'
-- (and /api/me/profile validates it as a free-form string). Every value except 'sleep'
-- failed the UPDATE with "invalid input value for enum", so onboarding_goal stayed NULL
-- and /auth/callback kept redirecting users back to /onboarding forever.

ALTER TABLE public.profiles
  ALTER COLUMN onboarding_goal TYPE TEXT
  USING onboarding_goal::TEXT;

-- The public.onboarding_goal type is intentionally left in place: dropping it would fail
-- if anything still depends on it, and an orphaned type is harmless.

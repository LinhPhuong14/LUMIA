-- Migration 009: Onboarding v2 fields + weekly assessments table

-- Add nickname column to profiles (nullable)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Add onboarding_data JSONB column to profiles (nullable, stores full onboarding answers)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Create weekly_assessments table
CREATE TABLE IF NOT EXISTS public.weekly_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  sleep_score INTEGER CHECK (sleep_score BETWEEN 1 AND 5),
  stress_score INTEGER CHECK (stress_score BETWEEN 1 AND 5),
  dominant_emotion TEXT,
  mood_influencer TEXT,
  sleep_hours TEXT,
  wake_feeling TEXT,
  improve_goals JSONB DEFAULT '[]',
  open_note TEXT,
  tonight_choice TEXT,
  raw_answers JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Enable RLS on weekly_assessments
ALTER TABLE public.weekly_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: users can SELECT their own rows
CREATE POLICY "weekly_assessments_select_own"
  ON public.weekly_assessments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: users can INSERT their own rows
CREATE POLICY "weekly_assessments_insert_own"
  ON public.weekly_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: users can UPDATE their own rows
CREATE POLICY "weekly_assessments_update_own"
  ON public.weekly_assessments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_weekly_assessments_user_id ON public.weekly_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_assessments_user_week ON public.weekly_assessments(user_id, week_start DESC);

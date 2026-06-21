-- Migration 023: add box_image_url to subscription_plans
ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS box_image_url TEXT;

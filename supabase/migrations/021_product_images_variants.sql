-- Migration 021: Add images (gallery) and variants to store_products
-- images: [{url, label?}][]  — gallery photos for product
-- variants: [{name, image_url?}][] — selectable variants (e.g. scent: Lavender, Bergamot)

ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS images   JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS variants JSONB NOT NULL DEFAULT '[]';

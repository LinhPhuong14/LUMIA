-- Journal decoration metadata (fonts, colors, stickers)
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS meta JSONB NOT NULL DEFAULT '{}'::jsonb;

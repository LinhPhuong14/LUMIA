-- Timer ambient + bell tracks (idempotent by title)
INSERT INTO public.audio_tracks (title, description, category, duration_seconds, is_free, sort_order)
SELECT v.title, v.description, v.category, v.duration_seconds, v.is_free, v.sort_order
FROM (VALUES
  ('Timer — Mưa', 'slug:rain', 'timer_ambient'::public.audio_category, NULL, false, 20),
  ('Timer — Sóng biển', 'slug:ocean', 'timer_ambient'::public.audio_category, NULL, false, 21),
  ('Timer — Rừng', 'slug:forest', 'timer_ambient'::public.audio_category, NULL, false, 22),
  ('Timer — White noise', 'slug:white-noise', 'timer_ambient'::public.audio_category, NULL, false, 23),
  ('Timer bell — bắt đầu', 'tag:bell-start', 'timer_ambient'::public.audio_category, 3, false, 24),
  ('Timer bell — kết thúc', 'tag:bell-end', 'timer_ambient'::public.audio_category, 3, false, 25)
) AS v(title, description, category, duration_seconds, is_free, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.audio_tracks WHERE description = v.description
);

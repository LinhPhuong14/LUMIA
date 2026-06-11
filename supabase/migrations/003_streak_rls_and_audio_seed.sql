-- Streak: allow users to update own row (logActivity without secret key)
CREATE POLICY "Users update own streak" ON public.streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Sample audio tracks (idempotent)
INSERT INTO public.audio_tracks (title, category, duration_seconds, is_free, sort_order)
SELECT * FROM (VALUES
  ('Tiếng mưa nhẹ', 'sleep_sound'::public.audio_category, 600, true, 1),
  ('Gió trong rừng', 'sleep_sound'::public.audio_category, 720, true, 2),
  ('Chuyện kể buổi tối', 'sleep_cast'::public.audio_category, 900, false, 3),
  ('Thả lỏng cơ thể', 'wind_down'::public.audio_category, 480, false, 4),
  ('Nhạc ngủ dịu', 'sleep_music'::public.audio_category, 1200, false, 5),
  ('Thiền hướng dẫn 10 phút', 'guided_meditation'::public.audio_category, 600, false, 6),
  ('Thiền mini 5 phút', 'mini_meditation'::public.audio_category, 300, true, 7),
  ('Ambient timer', 'timer_ambient'::public.audio_category, 1800, false, 8)
) AS v(title, category, duration_seconds, is_free, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.audio_tracks LIMIT 1);

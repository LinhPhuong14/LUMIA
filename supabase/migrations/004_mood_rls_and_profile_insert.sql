-- Fix mood upsert on production: explicit WITH CHECK + allow users to insert own profile (trigger fallback)

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users manage own mood checkins" ON public.mood_checkins;
CREATE POLICY "Users manage own mood checkins" ON public.mood_checkins
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own journal" ON public.journal_entries;
CREATE POLICY "Users manage own journal" ON public.journal_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own activity" ON public.activity_logs;
CREATE POLICY "Users manage own activity" ON public.activity_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Smart notifications: user preferences + push subscriptions + in-app log

CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id           UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Bedtime routine alarm
  bedtime_enabled   BOOLEAN NOT NULL DEFAULT true,
  bedtime_time      TIME NOT NULL DEFAULT '22:00:00',     -- "HH:MM" local
  bedtime_lead_min  INTEGER NOT NULL DEFAULT 30,          -- remind N min before bedtime
  -- Morning check-in
  morning_enabled   BOOLEAN NOT NULL DEFAULT false,
  morning_time      TIME NOT NULL DEFAULT '07:00:00',
  -- Streak protection (if no check-in by evening)
  streak_enabled    BOOLEAN NOT NULL DEFAULT true,
  streak_time       TIME NOT NULL DEFAULT '21:00:00',
  -- Weekly mood test
  weekly_enabled    BOOLEAN NOT NULL DEFAULT true,
  weekly_day        SMALLINT NOT NULL DEFAULT 0           -- 0=Sun,1=Mon,...,6=Sat
    CHECK (weekly_day BETWEEN 0 AND 6),
  weekly_time       TIME NOT NULL DEFAULT '09:00:00',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification settings"
  ON public.notification_settings FOR ALL USING (auth.uid() = user_id);

-- Web Push subscriptions (one per browser/device)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- In-app notification log (shown in bell dropdown)
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('bedtime','morning','streak','weekly','system')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  action_url  TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Trigger: auto-create default notification settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_notifications
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_notifications();

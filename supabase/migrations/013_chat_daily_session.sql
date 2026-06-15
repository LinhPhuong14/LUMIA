-- One chat session per user per day
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;

CREATE UNIQUE INDEX IF NOT EXISTS chat_sessions_user_date_uidx
  ON public.chat_sessions(user_id, date);

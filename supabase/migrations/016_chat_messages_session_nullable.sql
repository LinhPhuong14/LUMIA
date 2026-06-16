-- session_id was NOT NULL, blocking message saves when session creation fails.
-- History queries use user_id + created_at, not session_id, so this is safe.
ALTER TABLE public.chat_messages
  ALTER COLUMN session_id DROP NOT NULL;

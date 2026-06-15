-- Atomic increment for chat daily usage to prevent race conditions
CREATE OR REPLACE FUNCTION increment_chat_usage(p_user_id uuid, p_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO chat_daily_usage (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = chat_daily_usage.count + 1;
END;
$$;

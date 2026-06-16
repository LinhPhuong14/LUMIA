-- Allow multiple journal entries per day per user
-- Previously there was a UNIQUE(user_id, date) constraint that blocked this.
ALTER TABLE public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_user_id_date_key;

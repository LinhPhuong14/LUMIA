-- Fix: infinite recursion in profiles RLS when admin policy queries profiles again.
-- Run this on projects that already applied 001_initial_schema.sql.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins manage orders" ON public.orders;
CREATE POLICY "Admins manage orders" ON public.orders FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins read subscriptions" ON public.subscriptions;
CREATE POLICY "Admins read subscriptions" ON public.subscriptions FOR SELECT USING (public.is_admin());

-- Fix Profiles RLS to allow any authenticated user to view profiles
-- This is necessary so technicians and admins can see the reporter's name and phone number.

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;

CREATE POLICY "Everyone can view profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

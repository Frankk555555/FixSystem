-- ==============================================================================
-- Uni Repair Hub: Complete Database Schema for Supabase
-- ==============================================================================

-- 1. Custom Types & Enums
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('user', 'technician_electric', 'technician_plumbing', 'technician_general', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.repair_department AS ENUM ('electric', 'plumbing', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.repair_priority AS ENUM ('normal', 'urgent', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.repair_status AS ENUM ('pending', 'assigned', 'scheduled', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Helper Functions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path = public 
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  person_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;
CREATE POLICY "Everyone can view profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) = id);

-- Trigger for Profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at 
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Index for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Enable RLS for User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING ((select auth.uid()) = user_id);

-- Role check helper function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql 
STABLE 
SECURITY INVOKER 
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 5. Repair Tickets Table
CREATE TABLE IF NOT EXISTS public.repair_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT NOT NULL UNIQUE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department public.repair_department NOT NULL,
  priority public.repair_priority NOT NULL DEFAULT 'normal',
  building TEXT NOT NULL,
  floor TEXT,
  room TEXT,
  location_note TEXT,
  description TEXT NOT NULL,
  status public.repair_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_repair_tickets_reporter_id ON public.repair_tickets(reporter_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_department_status ON public.repair_tickets(department, status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_created_at ON public.repair_tickets(created_at DESC);

-- Enable RLS for Repair Tickets
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reporters view own tickets" ON public.repair_tickets;
CREATE POLICY "Reporters view own tickets" 
ON public.repair_tickets FOR SELECT 
TO authenticated
USING (
  (select auth.uid()) = reporter_id
  OR public.has_role((select auth.uid()), 'admin'::public.app_role)
  OR (department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
  OR (department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
  OR (department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
);

DROP POLICY IF EXISTS "Reporters create tickets" ON public.repair_tickets;
CREATE POLICY "Reporters create tickets" 
ON public.repair_tickets FOR INSERT 
TO authenticated
WITH CHECK ((select auth.uid()) = reporter_id);

DROP POLICY IF EXISTS "Reporters and staff update tickets" ON public.repair_tickets;
CREATE POLICY "Reporters and staff update tickets" 
ON public.repair_tickets FOR UPDATE 
TO authenticated
USING (
  (select auth.uid()) = reporter_id
  OR public.has_role((select auth.uid()), 'admin'::public.app_role)
  OR (department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
  OR (department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
  OR (department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
);

-- Trigger for Repair Tickets updated_at
DROP TRIGGER IF EXISTS tickets_updated_at ON public.repair_tickets;
CREATE TRIGGER tickets_updated_at 
BEFORE UPDATE ON public.repair_tickets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Sequence & Auto Ticket Code Generator
CREATE SEQUENCE IF NOT EXISTS public.repair_ticket_seq START 1;
GRANT USAGE ON SEQUENCE public.repair_ticket_seq TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SET search_path = public 
AS $$
BEGIN
  IF NEW.ticket_code IS NULL OR NEW.ticket_code = '' THEN
    NEW.ticket_code := 'RPR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.repair_ticket_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END; 
$$;

DROP TRIGGER IF EXISTS tickets_set_code ON public.repair_tickets;
CREATE TRIGGER tickets_set_code 
BEFORE INSERT ON public.repair_tickets
FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_code();

-- 7. Media Table
CREATE TABLE IF NOT EXISTS public.repair_ticket_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.repair_tickets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repair_ticket_media_ticket_id ON public.repair_ticket_media(ticket_id);

ALTER TABLE public.repair_ticket_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media follows ticket access" ON public.repair_ticket_media;
CREATE POLICY "Media follows ticket access" 
ON public.repair_ticket_media FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.repair_tickets t 
    WHERE t.id = ticket_id
      AND (
        (select auth.uid()) = t.reporter_id
        OR public.has_role((select auth.uid()), 'admin'::public.app_role)
        OR (t.department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
        OR (t.department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
        OR (t.department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
      )
  )
);

DROP POLICY IF EXISTS "Reporters insert media" ON public.repair_ticket_media;
CREATE POLICY "Reporters insert media" 
ON public.repair_ticket_media FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.repair_tickets t 
    WHERE t.id = ticket_id AND t.reporter_id = (select auth.uid())
  )
);

-- 8. Auto User Provisioning on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, person_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'person_code', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) 
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; 
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Permissions and Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.set_updated_at() TO postgres, supabase_auth_admin, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_ticket_code() TO postgres, supabase_auth_admin, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, supabase_auth_admin, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- 10. Storage Bucket & Policies for 'repair-media'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('repair-media', 'repair-media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users upload own repair media" ON storage.objects;
CREATE POLICY "Users upload own repair media" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'repair-media' 
  AND (select auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users view own repair media" ON storage.objects;
CREATE POLICY "Users view own repair media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'repair-media'
  AND (
    (select auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.repair_ticket_media m
      JOIN public.repair_tickets t ON t.id = m.ticket_id
      WHERE m.file_path = storage.objects.name
        AND (
          (t.department = 'electric'::public.repair_department  AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
          OR (t.department = 'plumbing'::public.repair_department AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
          OR (t.department = 'general'::public.repair_department  AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
        )
    )
  )
);

DROP POLICY IF EXISTS "Users update own repair media" ON storage.objects;
CREATE POLICY "Users update own repair media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'repair-media'
  AND (
    (select auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'repair-media'
  AND (
    (select auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Users delete own repair media" ON storage.objects;
CREATE POLICY "Users delete own repair media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'repair-media'
  AND (
    (select auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role((select auth.uid()), 'admin'::public.app_role)
  )
);

-- 11. Ticket Messages Table (Chat System)
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.repair_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can view ticket messages" 
ON public.ticket_messages FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.repair_tickets t 
    WHERE t.id = ticket_messages.ticket_id
      AND (
        (select auth.uid()) = t.reporter_id
        OR public.has_role((select auth.uid()), 'admin'::public.app_role)
        OR (t.department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
        OR (t.department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
        OR (t.department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
      )
  )
);

DROP POLICY IF EXISTS "Users can send ticket messages" ON public.ticket_messages;
CREATE POLICY "Users can send ticket messages" 
ON public.ticket_messages FOR INSERT 
TO authenticated
WITH CHECK (
  (select auth.uid()) = sender_id
  AND EXISTS (
    SELECT 1 
    FROM public.repair_tickets t 
    WHERE t.id = ticket_id
      AND (
        (select auth.uid()) = t.reporter_id
        OR public.has_role((select auth.uid()), 'admin'::public.app_role)
        OR (t.department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role))
        OR (t.department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role))
        OR (t.department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
      )
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'ticket_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
  END IF;
END $$;

-- 12. RPC Functions for Admin Role Management
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role public.app_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles _ur
    WHERE _ur.user_id = auth.uid() AND _ur.role = 'admin'::public.app_role
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can view users';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.email,
    p.phone,
    COALESCE(ur.role, 'user'::public.app_role)
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles _ur
    WHERE _ur.user_id = auth.uid() AND _ur.role = 'admin'::public.app_role
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can assign roles';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
END;
$$;

-- 13. Technician Unavailability
CREATE TABLE IF NOT EXISTS public.technician_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department public.repair_department NOT NULL,
  unavailable_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(technician_id, unavailable_date)
);

CREATE INDEX IF NOT EXISTS idx_tech_unavail_dept_date ON public.technician_unavailability(department, unavailable_date);

ALTER TABLE public.technician_unavailability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read unavailability" ON public.technician_unavailability;
CREATE POLICY "Everyone can read unavailability"
ON public.technician_unavailability FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Technicians can insert own unavailability" ON public.technician_unavailability;
CREATE POLICY "Technicians can insert own unavailability"
ON public.technician_unavailability FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.uid()) = technician_id
  AND (
    (department = 'electric' AND public.has_role((select auth.uid()), 'technician_electric'::public.app_role)) OR
    (department = 'plumbing' AND public.has_role((select auth.uid()), 'technician_plumbing'::public.app_role)) OR
    (department = 'general' AND public.has_role((select auth.uid()), 'technician_general'::public.app_role))
  )
);

DROP POLICY IF EXISTS "Technicians can delete own unavailability" ON public.technician_unavailability;
CREATE POLICY "Technicians can delete own unavailability"
ON public.technician_unavailability FOR DELETE
TO authenticated
USING ((select auth.uid()) = technician_id);

CREATE OR REPLACE FUNCTION public.get_unavailable_dates(dept public.repair_department)
RETURNS TABLE (unavailable_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_techs INT;
  target_role public.app_role;
BEGIN
  IF dept = 'electric' THEN target_role := 'technician_electric'::public.app_role;
  ELSIF dept = 'plumbing' THEN target_role := 'technician_plumbing'::public.app_role;
  ELSE target_role := 'technician_general'::public.app_role;
  END IF;

  SELECT COUNT(*) INTO total_techs FROM public.user_roles WHERE role = target_role;

  IF total_techs = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT t.unavailable_date
  FROM public.technician_unavailability t
  WHERE t.department = dept
  GROUP BY t.unavailable_date
  HAVING COUNT(DISTINCT t.technician_id) >= total_techs;
END;
$$;

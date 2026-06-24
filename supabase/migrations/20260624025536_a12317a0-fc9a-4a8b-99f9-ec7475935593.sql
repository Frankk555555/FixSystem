
-- Enums
CREATE TYPE public.app_role AS ENUM ('user', 'technician_electric', 'technician_plumbing', 'technician_general', 'admin');
CREATE TYPE public.repair_department AS ENUM ('electric', 'plumbing', 'general');
CREATE TYPE public.repair_priority AS ENUM ('normal', 'urgent', 'critical');
CREATE TYPE public.repair_status AS ENUM ('pending', 'assigned', 'scheduled', 'in_progress', 'completed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  person_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- repair_tickets
CREATE TABLE public.repair_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code TEXT NOT NULL UNIQUE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department repair_department NOT NULL,
  priority repair_priority NOT NULL DEFAULT 'normal',
  building TEXT NOT NULL,
  floor TEXT,
  room TEXT,
  location_note TEXT,
  description TEXT NOT NULL,
  status repair_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_tickets TO authenticated;
GRANT ALL ON public.repair_tickets TO service_role;
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters view own tickets" ON public.repair_tickets FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id
    OR public.has_role(auth.uid(), 'admin')
    OR (department = 'electric' AND public.has_role(auth.uid(), 'technician_electric'))
    OR (department = 'plumbing' AND public.has_role(auth.uid(), 'technician_plumbing'))
    OR (department = 'general' AND public.has_role(auth.uid(), 'technician_general')));

CREATE POLICY "Reporters create tickets" ON public.repair_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters and staff update tickets" ON public.repair_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = reporter_id
    OR public.has_role(auth.uid(), 'admin')
    OR (department = 'electric' AND public.has_role(auth.uid(), 'technician_electric'))
    OR (department = 'plumbing' AND public.has_role(auth.uid(), 'technician_plumbing'))
    OR (department = 'general' AND public.has_role(auth.uid(), 'technician_general')));

CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.repair_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sequence for ticket_code
CREATE SEQUENCE public.repair_ticket_seq START 1;
GRANT USAGE ON SEQUENCE public.repair_ticket_seq TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.ticket_code IS NULL OR NEW.ticket_code = '' THEN
    NEW.ticket_code := 'RPR-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.repair_ticket_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER tickets_set_code BEFORE INSERT ON public.repair_tickets
  FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_code();

-- Media
CREATE TABLE public.repair_ticket_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.repair_tickets(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.repair_ticket_media TO authenticated;
GRANT ALL ON public.repair_ticket_media TO service_role;
ALTER TABLE public.repair_ticket_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media follows ticket access" ON public.repair_ticket_media FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.repair_tickets t WHERE t.id = ticket_id
    AND (auth.uid() = t.reporter_id
      OR public.has_role(auth.uid(), 'admin')
      OR (t.department = 'electric' AND public.has_role(auth.uid(), 'technician_electric'))
      OR (t.department = 'plumbing' AND public.has_role(auth.uid(), 'technician_plumbing'))
      OR (t.department = 'general' AND public.has_role(auth.uid(), 'technician_general')))));

CREATE POLICY "Reporters insert media" ON public.repair_ticket_media FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.repair_tickets t WHERE t.id = ticket_id AND t.reporter_id = auth.uid()));

-- Auto profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, person_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'person_code', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 1. Add scheduled_at to repair_tickets
ALTER TABLE public.repair_tickets 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- 2. Create RPC Function for getting all users with roles
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
  -- Verify caller is admin
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

-- 3. Create RPC Function for assigning a user role
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles _ur
    WHERE _ur.user_id = auth.uid() AND _ur.role = 'admin'::public.app_role
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can assign roles';
  END IF;

  -- Delete existing roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role);
END;
$$;

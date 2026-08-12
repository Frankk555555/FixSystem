-- 1. Create table
CREATE TABLE IF NOT EXISTS public.technician_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department public.repair_department NOT NULL,
  unavailable_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(technician_id, unavailable_date)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_tech_unavail_dept_date ON public.technician_unavailability(department, unavailable_date);

-- Enable RLS
ALTER TABLE public.technician_unavailability ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
DROP POLICY IF EXISTS "Everyone can read unavailability" ON public.technician_unavailability;
CREATE POLICY "Everyone can read unavailability"
ON public.technician_unavailability FOR SELECT
TO authenticated
USING (true);

-- Policy: Technicians can insert own
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

-- Policy: Technicians can delete own
DROP POLICY IF EXISTS "Technicians can delete own unavailability" ON public.technician_unavailability;
CREATE POLICY "Technicians can delete own unavailability"
ON public.technician_unavailability FOR DELETE
TO authenticated
USING ((select auth.uid()) = technician_id);

-- 2. RPC to get completely unavailable dates for a department
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

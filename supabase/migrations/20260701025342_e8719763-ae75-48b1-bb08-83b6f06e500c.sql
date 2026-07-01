
-- 1) Switch has_role to SECURITY INVOKER (still works because user_roles RLS lets a user read their own rows)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- 2) Tighten storage SELECT policy: technicians only see media for tickets in their department
DROP POLICY IF EXISTS "Users view own repair media" ON storage.objects;

CREATE POLICY "Users view own repair media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'repair-media'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.repair_ticket_media m
      JOIN public.repair_tickets t ON t.id = m.ticket_id
      WHERE m.file_path = storage.objects.name
        AND (
          (t.department = 'electric'::public.repair_department  AND public.has_role(auth.uid(), 'technician_electric'::public.app_role))
          OR (t.department = 'plumbing'::public.repair_department AND public.has_role(auth.uid(), 'technician_plumbing'::public.app_role))
          OR (t.department = 'general'::public.repair_department  AND public.has_role(auth.uid(), 'technician_general'::public.app_role))
        )
    )
  )
);

-- 3) Add missing UPDATE / DELETE policies on storage.objects for repair-media
CREATE POLICY "Users update own repair media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'repair-media'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'repair-media'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

CREATE POLICY "Users delete own repair media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'repair-media'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

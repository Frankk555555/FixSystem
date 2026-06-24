
CREATE POLICY "Users upload own repair media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'repair-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own repair media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'repair-media' AND (
  auth.uid()::text = (storage.foldername(name))[1]
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'technician_electric')
  OR public.has_role(auth.uid(), 'technician_plumbing')
  OR public.has_role(auth.uid(), 'technician_general')
));

ALTER TABLE public.businesses
  ADD COLUMN photos text[] NOT NULL DEFAULT '{}',
  ADD COLUMN logo text,
  ADD COLUMN website text NOT NULL DEFAULT '',
  ADD COLUMN email text NOT NULL DEFAULT '',
  ADD COLUMN whatsapp text NOT NULL DEFAULT '',
  ADD COLUMN pincode text NOT NULL DEFAULT '',
  ADD COLUMN landmark text NOT NULL DEFAULT '',
  ADD COLUMN year_established integer,
  ADD COLUMN services jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN payment_methods text[] NOT NULL DEFAULT '{}',
  ADD COLUMN days_open text[] NOT NULL DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat}';

CREATE POLICY "read business photos" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'business-photos');
CREATE POLICY "owners upload business photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "owners delete business photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-photos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
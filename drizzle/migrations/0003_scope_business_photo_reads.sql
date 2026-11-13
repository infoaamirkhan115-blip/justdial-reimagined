ALTER POLICY "read business photos" ON storage.objects TO authenticated USING (
  bucket_id = 'business-photos' AND (
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
    OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role)
  )
);
CREATE POLICY "read published listing photos" ON storage.objects FOR SELECT TO anon, authenticated USING (
  bucket_id = 'business-photos' AND (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.status = 'approved' AND (storage.objects.name = ANY(b.photos) OR storage.objects.name = b.logo)
    )
    OR EXISTS (
      SELECT 1 FROM public.business_offerings o
      JOIN public.businesses b ON b.id = o.business_id
      WHERE o.published AND b.status = 'approved' AND storage.objects.name = ANY(o.photos)
    )
  )
);
COMMENT ON POLICY "read business photos" ON storage.objects IS 'Private uploads are readable only by their uploader folder owner or an authenticated admin.';
COMMENT ON POLICY "read published listing photos" ON storage.objects IS 'Public reads are limited to files explicitly referenced by approved listings or their published offerings; unrelated and unpublished uploads stay private.';

CREATE POLICY "Users can upload to their folder in community"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can read community objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community');

CREATE POLICY "Users can delete their own community objects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can delete any community object"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'community' AND public.has_role(auth.uid(), 'admin'));

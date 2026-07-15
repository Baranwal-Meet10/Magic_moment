
CREATE POLICY "Anyone can upload gift images" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'gift-images');

CREATE POLICY "Anyone can read gift images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gift-images');

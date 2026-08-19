-- ============================================================================
-- 20260820000000_enable_gift_images_read.sql
-- Ensure gift recipients can read uploaded gift images from Supabase storage
-- ============================================================================

-- 1. Set gift-images bucket to public so public URLs work seamlessly
UPDATE storage.buckets
   SET public = true
 WHERE id = 'gift-images';

-- 2. Add SELECT RLS policy on storage.objects for gift-images bucket
DROP POLICY IF EXISTS "Anyone can read gift images" ON storage.objects;
CREATE POLICY "Anyone can read gift images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gift-images');

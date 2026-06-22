/*
  # product-images Storage bucket + RLS (Task 2.4)

  Self-contained product images (D7): the admin uploads files to Supabase
  Storage, the catalog stores the resulting public URLs in
  products.hero_image_url / products.gallery_image_urls — never external URLs.

  Bucket is PUBLIC (read served by the CDN, no auth) so next/image can fetch
  the URLs on the public /tocatoare pages. Writes (insert/update/delete) are
  gated to admins via the existing public.is_admin() helper, mirroring the
  "Admin full access products" policy — same authorization model as the catalog.

  storage.objects already has RLS enabled by Supabase; we only add policies.
  This migration must be applied to the live Supabase project (founder hand-off)
  — the bucket and policies do not exist until then.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB (D7)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read: anyone may read objects in this bucket (catalog images).
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Admin write: only admins may upload / overwrite / delete product images.
DROP POLICY IF EXISTS "Admin insert product images" ON storage.objects;
CREATE POLICY "Admin insert product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin update product images" ON storage.objects;
CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete product images" ON storage.objects;
CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

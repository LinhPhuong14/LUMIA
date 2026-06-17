-- Add stock_quantity to store_products
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0;

-- Create blog-images storage bucket (RLS handled via policies)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Public can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND public.is_admin());

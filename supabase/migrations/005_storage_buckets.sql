-- Storage buckets for post images and chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-images',
  'post-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for post-images: authenticated upload, public read
CREATE POLICY "post_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-images');

-- RLS for chat-images: authenticated upload/read
CREATE POLICY "chat_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "chat_images_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'chat-images');

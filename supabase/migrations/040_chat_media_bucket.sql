-- Chat media bucket for audio and video (images use chat-images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  true,
  26214400,  -- 25MB for video
  ARRAY['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'video/webm', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "chat_media_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-media');

CREATE POLICY "chat_media_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'chat-media');

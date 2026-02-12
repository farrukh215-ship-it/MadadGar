-- Donation proof images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'donation-proof',
  'donation-proof',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "donation_proof_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'donation-proof');

CREATE POLICY "donation_proof_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'donation-proof');

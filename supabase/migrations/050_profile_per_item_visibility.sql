-- Per-item profile visibility (Facebook-style: each field public/private)

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_visibility TEXT DEFAULT 'public' CHECK (phone_visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS email_visibility TEXT DEFAULT 'public' CHECK (email_visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS bio_visibility TEXT DEFAULT 'public' CHECK (bio_visibility IN ('public', 'private'));

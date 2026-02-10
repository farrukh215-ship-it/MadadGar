-- Add avatar and cover photo to profiles (Facebook-style)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;

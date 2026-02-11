-- Add gender to profiles (male/female/other) for avatar icons
-- Google OAuth may provide gender in user_metadata; otherwise user can set in profile
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));

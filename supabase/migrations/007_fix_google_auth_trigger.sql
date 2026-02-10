-- Fix: Allow multiple Google users (no phone) - use NULL instead of ''
-- Drop UNIQUE on phone since multiple users can have NULL or no phone
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Update trigger to use NULL for missing phone (not '')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    NULLIF(COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.users.email),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User'
    )
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

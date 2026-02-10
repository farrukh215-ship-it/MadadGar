-- Harden handle_new_user trigger: set search_path, ensure robustness
-- Fixes 500 "unexpected_failure" when trigger runs in restricted context
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
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(split_part(COALESCE(NEW.email, ''), '@', 1)), ''),
      'User'
    )
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add gender param to ensure_user_profile for Google login
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.users (id, email, phone)
  VALUES (
    p_user_id,
    p_email,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.users.email),
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    updated_at = NOW();

  INSERT INTO public.profiles (user_id, display_name, gender)
  VALUES (
    p_user_id,
    COALESCE(NULLIF(TRIM(p_display_name), ''), 'User'),
    CASE WHEN p_gender IN ('male', 'female', 'other') THEN p_gender ELSE NULL END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(NULLIF(TRIM(p_display_name), ''), public.profiles.display_name),
    gender = COALESCE(CASE WHEN p_gender IN ('male', 'female', 'other') THEN p_gender ELSE NULL END, public.profiles.gender),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

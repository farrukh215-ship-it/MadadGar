-- Disable handle_new_user trigger (causes 500 on Google signup)
-- User/profile sync now handled in auth callback via ensure_user_profile RPC
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- RPC for auth callback to create user/profile after successful login
-- Replaces the trigger; avoids 500 from trigger running in auth context
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  p_user_id UUID,
  p_email TEXT DEFAULT NULL,
  p_display_name TEXT DEFAULT NULL
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

  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    p_user_id,
    COALESCE(NULLIF(TRIM(p_display_name), ''), 'User')
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(uuid, text, text) TO authenticated;

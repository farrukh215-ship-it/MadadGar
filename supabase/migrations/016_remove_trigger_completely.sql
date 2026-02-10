-- Completely remove trigger and function - no custom logic on auth.users
-- User/profile sync is done in auth callback via ensure_user_profile RPC

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

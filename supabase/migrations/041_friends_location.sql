-- Friends system + profiles location for Nearby
-- 1. Friend requests
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON public.friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON public.friend_requests(to_user_id);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friend_requests_select_own" ON public.friend_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "friend_requests_insert_own" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "friend_requests_update_recipient" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- 2. Friends (bidirectional)
CREATE TABLE IF NOT EXISTS public.friends (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON public.friends(friend_id);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friends_select_own" ON public.friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friends_insert_own" ON public.friends
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friends_delete_own" ON public.friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 3. Profiles location for Nearby (lat/lng -> geography)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location extensions.geography(POINT, 4326);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST(location) WHERE location IS NOT NULL;

-- RPC to update profile location (Supabase client cannot set geography directly)
CREATE OR REPLACE FUNCTION public.update_profile_location(p_user_id UUID, p_lat FLOAT, p_lng FLOAT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    UPDATE public.profiles
    SET location = extensions.ST_SetSRID(extensions.ST_MakePoint(p_lng, p_lat), 4326)::extensions.geography,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.profiles SET location = NULL, updated_at = NOW() WHERE user_id = p_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_profile_location(uuid, float, float) TO authenticated;

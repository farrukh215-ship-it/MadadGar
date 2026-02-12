-- 1) Availability: profiles.availability already exists - used for Busy/Available toggle

-- 2) Helper service area (kahan tak service - km radius)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS service_radius_km INT DEFAULT NULL
  CHECK (service_radius_km IS NULL OR (service_radius_km >= 1 AND service_radius_km <= 100));

-- 3) Notification preferences (friend requests, messages, etc on/off)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  friend_requests BOOLEAN DEFAULT TRUE,
  messages BOOLEAN DEFAULT TRUE,
  recommendations BOOLEAN DEFAULT TRUE,
  updates BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_preferences_select" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notification_preferences_insert" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notification_preferences_update" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- 4) Ratings - worker reply to reviews
ALTER TABLE public.ratings
ADD COLUMN IF NOT EXISTS worker_reply TEXT,
ADD COLUMN IF NOT EXISTS worker_reply_at TIMESTAMPTZ;

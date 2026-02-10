-- User presence for online indicator (green bulb)
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Users can update their own presence
CREATE POLICY "user_presence_update_own" ON public.user_presence
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_presence_insert_own" ON public.user_presence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can read presence (for online indicator)
CREATE POLICY "user_presence_select_all" ON public.user_presence
  FOR SELECT USING (true);

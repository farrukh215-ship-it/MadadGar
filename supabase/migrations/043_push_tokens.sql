-- Push tokens for mobile notifications (friend messages when app in background)
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_select_own" ON public.push_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "push_tokens_insert_own" ON public.push_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "push_tokens_update_own" ON public.push_tokens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "push_tokens_delete_own" ON public.push_tokens FOR DELETE USING (auth.uid() = user_id);

-- Ask for Help: Users ask for suggestions (e.g. best beauty parlour), others reply, like/share
CREATE TABLE IF NOT EXISTS public.help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  category_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_help_requests_author ON public.help_requests(author_id);
CREATE INDEX idx_help_requests_created ON public.help_requests(created_at DESC);
CREATE INDEX idx_help_requests_category ON public.help_requests(category_slug) WHERE category_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.help_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.help_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_help_suggestions_request ON public.help_suggestions(request_id);
CREATE INDEX idx_help_suggestions_author ON public.help_suggestions(author_id);

CREATE TABLE IF NOT EXISTS public.help_suggestion_likes (
  suggestion_id UUID NOT NULL REFERENCES public.help_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (suggestion_id, user_id)
);

CREATE INDEX idx_help_suggestion_likes_suggestion ON public.help_suggestion_likes(suggestion_id);

CREATE TABLE IF NOT EXISTS public.help_suggestion_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES public.help_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_help_suggestion_shares_suggestion ON public.help_suggestion_shares(suggestion_id);

-- RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_suggestion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_suggestion_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "help_requests_select_all" ON public.help_requests FOR SELECT USING (true);
CREATE POLICY "help_requests_insert_own" ON public.help_requests FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "help_requests_update_own" ON public.help_requests FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "help_suggestions_select_all" ON public.help_suggestions FOR SELECT USING (true);
CREATE POLICY "help_suggestions_insert_auth" ON public.help_suggestions FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "help_suggestion_likes_select_all" ON public.help_suggestion_likes FOR SELECT USING (true);
CREATE POLICY "help_suggestion_likes_insert_own" ON public.help_suggestion_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "help_suggestion_likes_delete_own" ON public.help_suggestion_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "help_suggestion_shares_select_all" ON public.help_suggestion_shares FOR SELECT USING (true);
CREATE POLICY "help_suggestion_shares_insert_own" ON public.help_suggestion_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

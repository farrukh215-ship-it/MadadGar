-- Post reactions (like/dislike) - one reaction per user per post
CREATE TABLE IF NOT EXISTS public.post_reactions (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON public.post_reactions(user_id);

-- Migrate madad to post_reactions (like)
INSERT INTO public.post_reactions (post_id, user_id, reaction)
SELECT post_id, user_id, 'like' FROM public.madad
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Post comments (Facebook-style)
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- Shares (in-app share with user)
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  sharer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_with_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_shares_post ON public.post_shares(post_id);

-- RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_reactions_select" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "post_reactions_insert" ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_reactions_update" ON public.post_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "post_reactions_delete" ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "post_comments_select" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "post_comments_insert" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_comments_delete" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "post_shares_select" ON public.post_shares FOR SELECT USING (true);
CREATE POLICY "post_shares_insert" ON public.post_shares FOR INSERT WITH CHECK (auth.uid() = sharer_id);

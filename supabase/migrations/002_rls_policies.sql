-- Madadgar - RLS Policies
-- Enable RLS on all tables

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.madad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_daily_count ENABLE ROW LEVEL SECURITY;

-- Categories: public read
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

-- Users: own read/update
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles: public read (masked phone handled in app)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Phone entities: insert for dedup (service role or app logic)
CREATE POLICY "phone_entities_select_all" ON public.phone_entities
  FOR SELECT USING (true);
CREATE POLICY "phone_entities_insert_all" ON public.phone_entities
  FOR INSERT WITH CHECK (true);

-- Posts: visible unless shadow_hidden (or own)
CREATE POLICY "posts_select_visible" ON public.posts
  FOR SELECT USING (
    shadow_hidden = FALSE OR author_id = auth.uid()
  );
CREATE POLICY "posts_insert_own" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete_own" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Madad
CREATE POLICY "madad_select_all" ON public.madad
  FOR SELECT USING (true);
CREATE POLICY "madad_insert_own" ON public.madad
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "madad_delete_own" ON public.madad
  FOR DELETE USING (auth.uid() = user_id);

-- Recommendations
CREATE POLICY "recommendations_select_all" ON public.recommendations
  FOR SELECT USING (true);
CREATE POLICY "recommendations_insert_own" ON public.recommendations
  FOR INSERT WITH CHECK (auth.uid() = recommender_id);

-- Ratings
CREATE POLICY "ratings_select_all" ON public.ratings
  FOR SELECT USING (true);
CREATE POLICY "ratings_insert_own" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Chat threads: participants only
CREATE POLICY "chat_threads_select_participant" ON public.chat_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE thread_id = chat_threads.id AND user_id = auth.uid()
    )
  );
CREATE POLICY "chat_threads_insert_all" ON public.chat_threads
  FOR INSERT WITH CHECK (true);

-- Chat participants
CREATE POLICY "chat_participants_select_thread" ON public.chat_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.chat_participants cp2
      WHERE cp2.thread_id = chat_participants.thread_id AND cp2.user_id = auth.uid()
    )
  );
CREATE POLICY "chat_participants_insert_all" ON public.chat_participants
  FOR INSERT WITH CHECK (true);

-- Messages: participants only
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE thread_id = messages.thread_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE thread_id = messages.thread_id AND user_id = auth.uid()
    )
  );

-- Reports
CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Blocks
CREATE POLICY "blocks_select_own" ON public.blocks
  FOR SELECT USING (blocker_id = auth.uid() OR blocked_id = auth.uid());
CREATE POLICY "blocks_insert_own" ON public.blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "blocks_delete_own" ON public.blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- Post daily count: system/managed
CREATE POLICY "post_daily_count_select_own" ON public.post_daily_count
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "post_daily_count_all" ON public.post_daily_count
  FOR ALL USING (false); -- Only trigger/function can insert

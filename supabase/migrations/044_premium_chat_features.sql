-- Premium chat features (WhatsApp-style)
-- 1. Message deletion for everyone
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.users(id);

-- 2. Pinned messages
CREATE TABLE IF NOT EXISTS public.chat_pinned_messages (
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (thread_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_pinned_thread ON public.chat_pinned_messages(thread_id);

ALTER TABLE public.chat_pinned_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_pinned_select_participant" ON public.chat_pinned_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.thread_id = chat_pinned_messages.thread_id AND cp.user_id = auth.uid())
  );
CREATE POLICY "chat_pinned_insert_participant" ON public.chat_pinned_messages
  FOR INSERT WITH CHECK (
    auth.uid() = pinned_by AND
    EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.thread_id = chat_pinned_messages.thread_id AND cp.user_id = auth.uid())
  );
CREATE POLICY "chat_pinned_delete_participant" ON public.chat_pinned_messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.thread_id = chat_pinned_messages.thread_id AND cp.user_id = auth.uid())
  );

-- 3. Chat themes (premium: custom background per chat)
CREATE TABLE IF NOT EXISTS public.chat_themes (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'default' CHECK (theme IN ('default', 'gradient-1', 'gradient-2', 'dark', 'minimal')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, thread_id)
);

ALTER TABLE public.chat_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_themes_own" ON public.chat_themes FOR ALL USING (auth.uid() = user_id);

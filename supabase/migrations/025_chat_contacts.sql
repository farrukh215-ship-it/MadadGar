-- Contacts: users we've added to chat (messenger shows only these)
CREATE TABLE IF NOT EXISTS public.chat_contacts (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, contact_id),
  CHECK (user_id != contact_id)
);

ALTER TABLE public.chat_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_contacts_select_own" ON public.chat_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_contacts_insert_own" ON public.chat_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_contacts_delete_own" ON public.chat_contacts
  FOR DELETE USING (auth.uid() = user_id);

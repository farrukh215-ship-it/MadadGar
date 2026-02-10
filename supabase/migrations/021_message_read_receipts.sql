-- Add read receipts for messages (seen indicator)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Index for efficient read status queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON public.messages(thread_id, read_at) WHERE read_at IS NOT NULL;

-- Allow participants to mark messages as read (recipient updates read_at)
CREATE POLICY "messages_update_read_participant" ON public.messages
  FOR UPDATE USING (
    sender_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE thread_id = messages.thread_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    sender_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE thread_id = messages.thread_id AND user_id = auth.uid()
    )
  );

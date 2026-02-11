-- Allow sender to soft-delete their own messages (deleted_at, deleted_by)
CREATE POLICY "messages_update_sender_delete" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

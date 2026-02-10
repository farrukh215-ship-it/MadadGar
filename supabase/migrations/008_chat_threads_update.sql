-- Allow participants to update chat_threads (e.g. updated_at on new message)
CREATE POLICY "chat_threads_update_participant" ON public.chat_threads
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE thread_id = chat_threads.id AND user_id = auth.uid()
    )
  );

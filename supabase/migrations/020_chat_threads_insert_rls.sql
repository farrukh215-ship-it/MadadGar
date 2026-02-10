-- Fix chat_threads INSERT RLS: allow authenticated users to create threads
DROP POLICY IF EXISTS "chat_threads_insert_all" ON public.chat_threads;
CREATE POLICY "chat_threads_insert_all" ON public.chat_threads
  FOR INSERT WITH CHECK (true);

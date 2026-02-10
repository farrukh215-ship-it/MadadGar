-- Fix infinite recursion in chat_participants RLS policy
-- Policy was querying chat_participants inside itself

-- Helper: bypass RLS to check if user is in thread (no recursion)
CREATE OR REPLACE FUNCTION public.user_in_thread(p_thread_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE thread_id = p_thread_id AND user_id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- Replace recursive policy with function-based check
DROP POLICY IF EXISTS "chat_participants_select_thread" ON public.chat_participants;
CREATE POLICY "chat_participants_select_thread" ON public.chat_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.user_in_thread(thread_id, auth.uid())
  );

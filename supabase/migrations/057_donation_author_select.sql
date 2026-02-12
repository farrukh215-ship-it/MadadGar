-- Allow authors to see their own donation requests (including unverified)
CREATE POLICY "donation_requests_select_own" ON public.donation_requests
  FOR SELECT USING (auth.uid() = author_id);

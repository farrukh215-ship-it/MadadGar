-- Extend ratings from 1-5 to 1-10 stars
ALTER TABLE public.ratings DROP CONSTRAINT IF EXISTS ratings_rating_check;
ALTER TABLE public.ratings ADD CONSTRAINT ratings_rating_check CHECK (rating >= 1 AND rating <= 10);

-- Allow users to update their own ratings
DROP POLICY IF EXISTS "ratings_update_own" ON public.ratings;
CREATE POLICY "ratings_update_own" ON public.ratings
  FOR UPDATE USING (auth.uid() = rater_id);

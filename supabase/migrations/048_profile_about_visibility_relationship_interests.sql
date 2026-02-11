-- Profile about/contact visibility + relationship interests for Interested People

-- 1) Profile about/contact visibility
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS about_visibility TEXT NOT NULL DEFAULT 'public'
  CHECK (about_visibility IN ('public', 'private'));

-- 2) Relationship-focused lifestyle interests (Friendship + Marriage)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  -- Friendship (5)
  ('friendship-new-friends', 'New Friends', '🤝', 'lifestyle', 120, false, 'Meet new people for casual hangouts'),
  ('friendship-study-buddies', 'Study Buddies', '📚', 'lifestyle', 121, false, 'Find classmates and study partners'),
  ('friendship-gym-partners', 'Gym Partners', '🏋️', 'lifestyle', 122, false, 'Workout & fitness partners'),
  ('friendship-gaming', 'Gaming Friends', '🎮', 'lifestyle', 123, false, 'Online & local gaming buddies'),
  ('friendship-travel', 'Travel Friends', '🧳', 'lifestyle', 124, false, 'People to explore new places with'),
  -- Marriage / Rishta (5)
  ('marriage-serious', 'Serious Marriage', '💍', 'lifestyle', 130, true, 'Long-term, serious marriage focused'),
  ('marriage-family-intro', 'Family Introductions', '👨‍👩‍👧‍👦', 'lifestyle', 131, false, 'Family introduced rishta'),
  ('marriage-educated', 'Educated Match', '🎓', 'lifestyle', 132, false, 'Education-focused match preferences'),
  ('marriage-abroad', 'Abroad Match', '✈️', 'lifestyle', 133, false, 'Interested in abroad proposals'),
  ('marriage-professionals', 'Working Professionals', '💼', 'lifestyle', 134, false, 'Professionals looking for marriage')
ON CONFLICT (slug) DO NOTHING;


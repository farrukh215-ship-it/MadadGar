-- Interest-based chat framework: users can add interests and discover/chat with same-interest people
-- Each interest (tanah) has premium features to add value

-- Interest categories: unified list for matching
CREATE TABLE IF NOT EXISTS public.interest_categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🌟',
  parent_group TEXT NOT NULL CHECK (parent_group IN ('trusted-helpers', 'food-points', 'products', 'sale', 'general')),
  sort_order INT DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User interests: what each user is interested in (for matching)
CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  interest_slug TEXT NOT NULL REFERENCES public.interest_categories(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, interest_slug)
);

CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);
CREATE INDEX idx_user_interests_slug ON public.user_interests(interest_slug);

-- Seed interest categories (trusted helpers + food + products + sale)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('mechanic', 'Mechanic', '🔧', 'trusted-helpers', 1, false, null),
  ('electrician', 'Electrician', '⚡', 'trusted-helpers', 2, false, null),
  ('plumber', 'Plumber', '🔩', 'trusted-helpers', 3, false, null),
  ('ac-technician', 'AC Technician', '❄️', 'trusted-helpers', 4, false, null),
  ('cook', 'Cook', '👨‍🍳', 'trusted-helpers', 5, false, null),
  ('driver', 'Driver', '🚗', 'trusted-helpers', 6, false, null),
  ('cleaner', 'Cleaner', '🧹', 'trusted-helpers', 7, false, null),
  ('carpenter', 'Carpenter', '🪚', 'trusted-helpers', 8, false, null),
  ('painter', 'Painter', '🎨', 'trusted-helpers', 9, false, null),
  ('generator-tech', 'Generator Tech', '🔌', 'trusted-helpers', 10, false, null),
  ('welder', 'Welder', '🔥', 'trusted-helpers', 11, false, null),
  ('mobile-repair', 'Mobile Repair', '📱', 'trusted-helpers', 12, false, null),
  ('computer-it', 'Computer/IT', '💻', 'trusted-helpers', 13, false, null),
  ('emergency-helper', 'Emergency Helper', '🚨', 'trusted-helpers', 14, true, 'Priority visibility & verified badge'),
  ('fast-foods', 'Fast Foods', '🍔', 'food-points', 20, false, null),
  ('desi-foods', 'Desi Foods', '🍛', 'food-points', 21, false, null),
  ('biryani', 'Biryani', '🍚', 'food-points', 22, false, null),
  ('chinese', 'Chinese', '🥡', 'food-points', 23, false, null),
  ('bbq', 'BBQ', '🍖', 'food-points', 24, false, null),
  ('sweets', 'Sweets', '🍰', 'food-points', 25, true, 'Featured in Food Points'),
  ('smart-watches', 'Smart Watches', '⌚', 'products', 30, false, null),
  ('mobiles', 'Mobiles', '📱', 'products', 31, false, null),
  ('laptops', 'Laptops', '💻', 'products', 32, false, null),
  ('headphones', 'Headphones', '🎧', 'products', 33, false, null),
  ('used-products', 'Used Products', '📦', 'sale', 40, false, null),
  ('dating', 'Dating & Social', '💕', 'general', 50, true, 'Premium matching & visibility')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interest_categories_select" ON public.interest_categories FOR SELECT USING (true);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_interests_select_own" ON public.user_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_interests_select_authenticated" ON public.user_interests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "user_interests_insert_own" ON public.user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_interests_delete_own" ON public.user_interests FOR DELETE USING (auth.uid() = user_id);

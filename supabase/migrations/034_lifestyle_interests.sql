-- Replace interests with normal lifestyle interests (hobbies, sports, TV, etc.)
-- 12 interests per tanah (group)

-- Update parent_group constraint to allow lifestyle groups
ALTER TABLE public.interest_categories DROP CONSTRAINT IF EXISTS interest_categories_parent_group_check;
ALTER TABLE public.interest_categories ADD CONSTRAINT interest_categories_parent_group_check
  CHECK (parent_group IN ('hobbies', 'sports', 'entertainment', 'food-dining', 'travel', 'technology', 'lifestyle'));

-- Clear old interests (user_interests will cascade or we keep user data but remove orphan refs - slugs will change so delete user_interests for old slugs)
DELETE FROM public.user_interests;
DELETE FROM public.interest_categories;

-- Seed: Hobbies (12)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('reading', 'Reading', '📚', 'hobbies', 1, false, null),
  ('photography', 'Photography', '📷', 'hobbies', 2, false, null),
  ('gardening', 'Gardening', '🌱', 'hobbies', 3, false, null),
  ('cooking', 'Cooking', '👨‍🍳', 'hobbies', 4, false, null),
  ('art', 'Art', '🎨', 'hobbies', 5, false, null),
  ('music', 'Music', '🎵', 'hobbies', 6, false, null),
  ('gaming', 'Gaming', '🎮', 'hobbies', 7, false, null),
  ('crafts', 'Crafts', '✂️', 'hobbies', 8, false, null),
  ('collecting', 'Collecting', '🏆', 'hobbies', 9, false, null),
  ('diy', 'DIY', '🔧', 'hobbies', 10, false, null),
  ('writing', 'Writing', '✍️', 'hobbies', 11, false, null),
  ('drawing', 'Drawing', '🖌️', 'hobbies', 12, false, null);

-- Sports (12)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('cricket', 'Cricket', '🏏', 'sports', 20, false, null),
  ('football', 'Football', '⚽', 'sports', 21, false, null),
  ('tennis', 'Tennis', '🎾', 'sports', 22, false, null),
  ('swimming', 'Swimming', '🏊', 'sports', 23, false, null),
  ('gym', 'Gym', '💪', 'sports', 24, false, null),
  ('running', 'Running', '🏃', 'sports', 25, false, null),
  ('cycling', 'Cycling', '🚴', 'sports', 26, false, null),
  ('badminton', 'Badminton', '🏸', 'sports', 27, false, null),
  ('table-tennis', 'Table Tennis', '🏓', 'sports', 28, false, null),
  ('volleyball', 'Volleyball', '🏐', 'sports', 29, false, null),
  ('martial-arts', 'Martial Arts', '🥋', 'sports', 30, false, null),
  ('yoga', 'Yoga', '🧘', 'sports', 31, true, 'Featured in Sports');

-- Entertainment / TV (12)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('movies', 'Movies', '🎬', 'entertainment', 40, false, null),
  ('tv-shows', 'TV Shows', '📺', 'entertainment', 41, false, null),
  ('drama', 'Drama', '🎭', 'entertainment', 42, false, null),
  ('comedy', 'Comedy', '😂', 'entertainment', 43, false, null),
  ('documentaries', 'Documentaries', '📽️', 'entertainment', 44, false, null),
  ('web-series', 'Web Series', '📱', 'entertainment', 45, false, null),
  ('stand-up', 'Stand-up', '🎤', 'entertainment', 46, false, null),
  ('concerts', 'Concerts', '🎸', 'entertainment', 47, false, null),
  ('theatre', 'Theatre', '🎟️', 'entertainment', 48, false, null),
  ('anime', 'Anime', '✨', 'entertainment', 49, false, null),
  ('podcasts', 'Podcasts', '🎧', 'entertainment', 50, false, null),
  ('streaming', 'Streaming', '📡', 'entertainment', 51, true, 'Featured in Entertainment');

-- Food & Dining (12)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('biryani', 'Biryani', '🍚', 'food-dining', 60, false, null),
  ('bbq', 'BBQ', '🍖', 'food-dining', 61, false, null),
  ('desi-food', 'Desi Food', '🍛', 'food-dining', 62, false, null),
  ('chinese', 'Chinese', '🥡', 'food-dining', 63, false, null),
  ('fast-food', 'Fast Food', '🍔', 'food-dining', 64, false, null),
  ('sweets', 'Sweets', '🍰', 'food-dining', 65, false, null),
  ('coffee', 'Coffee', '☕', 'food-dining', 66, false, null),
  ('tea', 'Tea', '🍵', 'food-dining', 67, false, null),
  ('street-food', 'Street Food', '🌮', 'food-dining', 68, false, null),
  ('fine-dining', 'Fine Dining', '🍽️', 'food-dining', 69, false, null),
  ('baking', 'Baking', '🥐', 'food-dining', 70, false, null),
  ('healthy-eating', 'Healthy Eating', '🥗', 'food-dining', 71, true, 'Featured in Food');

-- Travel (12)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('road-trips', 'Road Trips', '🚗', 'travel', 80, false, null),
  ('hiking', 'Hiking', '🥾', 'travel', 81, false, null),
  ('camping', 'Camping', '⛺', 'travel', 82, false, null),
  ('beach', 'Beach', '🏖️', 'travel', 83, false, null),
  ('mountains', 'Mountains', '⛰️', 'travel', 84, false, null),
  ('city-tours', 'City Tours', '🏙️', 'travel', 85, false, null),
  ('adventure', 'Adventure', '🧗', 'travel', 86, false, null),
  ('family-trips', 'Family Trips', '👨‍👩‍👧‍👦', 'travel', 87, false, null),
  ('solo-travel', 'Solo Travel', '🧳', 'travel', 88, false, null),
  ('historical-places', 'Historical Places', '🏛️', 'travel', 89, false, null),
  ('religious-tourism', 'Religious Tourism', '🕌', 'travel', 90, false, null),
  ('photography-travel', 'Travel Photography', '📸', 'travel', 91, true, 'Featured in Travel');

-- Technology (12)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('tech-gaming', 'Gaming', '🎮', 'technology', 100, false, null),
  ('smartphones', 'Smartphones', '📱', 'technology', 101, false, null),
  ('laptops', 'Laptops', '💻', 'technology', 102, false, null),
  ('tech-photography', 'Photography Tech', '📷', 'technology', 103, false, null),
  ('coding', 'Coding', '💻', 'technology', 104, false, null),
  ('ai', 'AI', '🤖', 'technology', 105, false, null),
  ('social-media', 'Social Media', '📲', 'technology', 106, false, null),
  ('streaming-tech', 'Streaming', '📡', 'technology', 107, false, null),
  ('gadgets', 'Gadgets', '⌚', 'technology', 108, false, null),
  ('apps', 'Apps', '📲', 'technology', 109, false, null),
  ('crypto', 'Crypto', '₿', 'technology', 110, false, null),
  ('startups', 'Startups', '🚀', 'technology', 111, true, 'Featured in Tech');
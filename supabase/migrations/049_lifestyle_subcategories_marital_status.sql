-- Lifestyle: 3 new sub-categories + marital_status for profiles

-- 1) Add 3 new lifestyle sub-categories (above existing friendship/marriage)
INSERT INTO public.interest_categories (slug, name, icon, parent_group, sort_order, is_premium, premium_description) VALUES
  ('lifestyle-single-looking', 'Single looking for someone', '💕', 'lifestyle', 115, false, 'Looking for a life partner'),
  ('lifestyle-friendship', 'Looking for friendship', '🤝', 'lifestyle', 116, false, 'Seeking genuine friendships'),
  ('lifestyle-loneliness', 'Coping with loneliness', '💭', 'lifestyle', 117, false, 'Seeking companionship when alone')
ON CONFLICT (slug) DO NOTHING;

-- 2) Add marital_status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS marital_status TEXT
  CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'prefer_not_to_say'));

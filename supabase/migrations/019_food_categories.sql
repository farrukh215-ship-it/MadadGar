-- Add food sub-categories for food recommendations
INSERT INTO public.categories (slug, name, sort_order) VALUES
  ('fast-foods', 'Fast foods', 15),
  ('desi-foods', 'Desi foods', 16),
  ('biryani', 'Biryani', 17),
  ('chinese', 'Chinese', 18),
  ('bbq', 'BBQ', 19),
  ('sweets', 'Sweets', 20)
ON CONFLICT (slug) DO NOTHING;

-- Sale subcategories + 3 new categories: Cosmetics, Footwear, Toys
CREATE TABLE IF NOT EXISTS public.sale_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.sale_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE(category_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_sale_subcategories_category ON public.sale_subcategories(category_id);

-- Add subcategory_id to sale_listings
ALTER TABLE public.sale_listings ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES public.sale_subcategories(id) ON DELETE SET NULL;

-- Insert new categories
INSERT INTO public.sale_categories (slug, name, sort_order) VALUES
  ('cosmetics', 'Cosmetics', 13),
  ('footwear', 'Footwear', 14),
  ('toys', 'Toys', 15)
ON CONFLICT (slug) DO NOTHING;

-- Cosmetics subcategories (5)
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'lipstick', 'Lipstick', 1 FROM sale_categories WHERE slug = 'cosmetics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'skincare', 'Skincare', 2 FROM sale_categories WHERE slug = 'cosmetics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'face', 'Face Makeup', 3 FROM sale_categories WHERE slug = 'cosmetics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'hair', 'Hair Care', 4 FROM sale_categories WHERE slug = 'cosmetics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'fragrance', 'Fragrance', 5 FROM sale_categories WHERE slug = 'cosmetics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Footwear subcategories (5)
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'men', 'Men', 1 FROM sale_categories WHERE slug = 'footwear' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'women', 'Women', 2 FROM sale_categories WHERE slug = 'footwear' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'kids', 'Kids', 3 FROM sale_categories WHERE slug = 'footwear' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'sports', 'Sports', 4 FROM sale_categories WHERE slug = 'footwear' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'formal', 'Formal', 5 FROM sale_categories WHERE slug = 'footwear' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Toys subcategories (5)
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'action-figures', 'Action Figures', 1 FROM sale_categories WHERE slug = 'toys' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'board-games', 'Board Games', 2 FROM sale_categories WHERE slug = 'toys' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'educational', 'Educational', 3 FROM sale_categories WHERE slug = 'toys' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'outdoor', 'Outdoor', 4 FROM sale_categories WHERE slug = 'toys' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'stuffed', 'Stuffed Toys', 5 FROM sale_categories WHERE slug = 'toys' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

ALTER TABLE public.sale_subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_subcategories_select" ON public.sale_subcategories FOR SELECT USING (true);

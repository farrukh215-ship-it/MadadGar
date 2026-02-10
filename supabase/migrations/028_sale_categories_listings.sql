-- Sale categories (12) - Used products for sale
CREATE TABLE IF NOT EXISTS public.sale_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0
);

INSERT INTO public.sale_categories (slug, name, sort_order) VALUES
  ('mobiles', 'Mobiles', 1),
  ('laptops', 'Laptops', 2),
  ('electronics', 'Electronics', 3),
  ('furniture', 'Furniture', 4),
  ('vehicles', 'Vehicles', 5),
  ('bikes', 'Bikes', 6),
  ('clothing', 'Clothing', 7),
  ('books', 'Books', 8),
  ('home', 'Home & Garden', 9),
  ('sports', 'Sports', 10),
  ('tools', 'Tools', 11),
  ('other', 'Other', 12)
ON CONFLICT (slug) DO NOTHING;

-- Sale listings (used products, max 3 images)
CREATE TABLE IF NOT EXISTS public.sale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.sale_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  area_text TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_listings_category ON public.sale_listings(category_id);
CREATE INDEX IF NOT EXISTS idx_sale_listings_created ON public.sale_listings(created_at DESC);

ALTER TABLE public.sale_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sale_listings_select" ON public.sale_listings FOR SELECT USING (true);
CREATE POLICY "sale_listings_insert" ON public.sale_listings FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "sale_listings_update" ON public.sale_listings FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "sale_listings_delete" ON public.sale_listings FOR DELETE USING (auth.uid() = author_id);

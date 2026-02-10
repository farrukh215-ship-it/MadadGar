-- Product categories (15) - Top Products feature
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0
);

INSERT INTO public.product_categories (slug, name, sort_order) VALUES
  ('smart-watches', 'Smart Watches', 1),
  ('mobiles', 'Mobiles', 2),
  ('laptops', 'Laptops', 3),
  ('headphones', 'Headphones', 4),
  ('tablets', 'Tablets', 5),
  ('cameras', 'Cameras', 6),
  ('tv', 'TV & Monitors', 7),
  ('gaming', 'Gaming', 8),
  ('kitchen', 'Kitchen Appliances', 9),
  ('home', 'Home Appliances', 10),
  ('fashion', 'Fashion', 11),
  ('footwear', 'Footwear', 12),
  ('bags', 'Bags', 13),
  ('sports', 'Sports', 14),
  ('books', 'Books', 15)
ON CONFLICT (slug) DO NOTHING;

-- Products (recommended by price range)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_min DECIMAL(12,2),
  price_max DECIMAL(12,2),
  description TEXT,
  images TEXT[] DEFAULT '{}',
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price_min, price_max);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "products_update" ON public.products FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "products_delete" ON public.products FOR DELETE USING (auth.uid() = author_id);

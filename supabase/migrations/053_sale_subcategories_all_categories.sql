-- Subcategories for all existing sale categories (mobiles, laptops, electronics, etc.)
-- Cosmetics, Footwear, Toys already have subcategories from 052

-- Mobiles
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'iphone', 'iPhone', 1 FROM sale_categories WHERE slug = 'mobiles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'samsung', 'Samsung', 2 FROM sale_categories WHERE slug = 'mobiles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'xiaomi', 'Xiaomi', 3 FROM sale_categories WHERE slug = 'mobiles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'oneplus', 'OnePlus', 4 FROM sale_categories WHERE slug = 'mobiles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'budget-phones', 'Budget phones', 5 FROM sale_categories WHERE slug = 'mobiles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Laptops
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'gaming', 'Gaming', 1 FROM sale_categories WHERE slug = 'laptops' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'office', 'Office', 2 FROM sale_categories WHERE slug = 'laptops' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'student', 'Student', 3 FROM sale_categories WHERE slug = 'laptops' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'macbook', 'MacBook', 4 FROM sale_categories WHERE slug = 'laptops' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'ultrabook', 'Ultrabook', 5 FROM sale_categories WHERE slug = 'laptops' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Electronics
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'tv', 'TV', 1 FROM sale_categories WHERE slug = 'electronics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'speakers', 'Speakers', 2 FROM sale_categories WHERE slug = 'electronics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'headphones', 'Headphones', 3 FROM sale_categories WHERE slug = 'electronics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'cameras', 'Cameras', 4 FROM sale_categories WHERE slug = 'electronics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'accessories', 'Accessories', 5 FROM sale_categories WHERE slug = 'electronics' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Furniture
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'sofas', 'Sofas', 1 FROM sale_categories WHERE slug = 'furniture' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'beds', 'Beds', 2 FROM sale_categories WHERE slug = 'furniture' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'chairs', 'Chairs', 3 FROM sale_categories WHERE slug = 'furniture' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'tables', 'Tables', 4 FROM sale_categories WHERE slug = 'furniture' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'wardrobes', 'Wardrobes', 5 FROM sale_categories WHERE slug = 'furniture' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Vehicles
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'cars', 'Cars', 1 FROM sale_categories WHERE slug = 'vehicles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'suzuki', 'Suzuki', 2 FROM sale_categories WHERE slug = 'vehicles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'honda', 'Honda', 3 FROM sale_categories WHERE slug = 'vehicles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'toyota', 'Toyota', 4 FROM sale_categories WHERE slug = 'vehicles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'commercial', 'Commercial', 5 FROM sale_categories WHERE slug = 'vehicles' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Bikes
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, '125cc', '125cc', 1 FROM sale_categories WHERE slug = 'bikes' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, '70cc', '70cc', 2 FROM sale_categories WHERE slug = 'bikes' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'sport', 'Sport', 3 FROM sale_categories WHERE slug = 'bikes' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'scooters', 'Scooters', 4 FROM sale_categories WHERE slug = 'bikes' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'electric', 'Electric', 5 FROM sale_categories WHERE slug = 'bikes' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Clothing
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'men', 'Men', 1 FROM sale_categories WHERE slug = 'clothing' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'women', 'Women', 2 FROM sale_categories WHERE slug = 'clothing' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'kids', 'Kids', 3 FROM sale_categories WHERE slug = 'clothing' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'shoes', 'Shoes', 4 FROM sale_categories WHERE slug = 'clothing' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'bags', 'Bags', 5 FROM sale_categories WHERE slug = 'clothing' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Home
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'kitchen', 'Kitchen', 1 FROM sale_categories WHERE slug = 'home' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'decor', 'Decor', 2 FROM sale_categories WHERE slug = 'home' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'appliances', 'Appliances', 3 FROM sale_categories WHERE slug = 'home' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'storage', 'Storage', 4 FROM sale_categories WHERE slug = 'home' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'lighting', 'Lighting', 5 FROM sale_categories WHERE slug = 'home' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Sports
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'cricket', 'Cricket', 1 FROM sale_categories WHERE slug = 'sports' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'football', 'Football', 2 FROM sale_categories WHERE slug = 'sports' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'gym', 'Gym', 3 FROM sale_categories WHERE slug = 'sports' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'cycling', 'Cycling', 4 FROM sale_categories WHERE slug = 'sports' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'sports-accessories', 'Accessories', 5 FROM sale_categories WHERE slug = 'sports' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Books
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'novels', 'Novels', 1 FROM sale_categories WHERE slug = 'books' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'islamic', 'Islamic', 2 FROM sale_categories WHERE slug = 'books' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'academic', 'Academic', 3 FROM sale_categories WHERE slug = 'books' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'kids-books', 'Kids books', 4 FROM sale_categories WHERE slug = 'books' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'test-prep', 'Test prep', 5 FROM sale_categories WHERE slug = 'books' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Tools
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'power-tools', 'Power tools', 1 FROM sale_categories WHERE slug = 'tools' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'hand-tools', 'Hand tools', 2 FROM sale_categories WHERE slug = 'tools' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'car-tools', 'Car tools', 3 FROM sale_categories WHERE slug = 'tools' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'construction', 'Construction', 4 FROM sale_categories WHERE slug = 'tools' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'gardening', 'Gardening', 5 FROM sale_categories WHERE slug = 'tools' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

-- Other
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'bundles', 'Bundles', 1 FROM sale_categories WHERE slug = 'other' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'clearance', 'Clearance', 2 FROM sale_categories WHERE slug = 'other' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'gadgets', 'Gadgets', 3 FROM sale_categories WHERE slug = 'other' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'home-mix', 'Home mix', 4 FROM sale_categories WHERE slug = 'other' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;
INSERT INTO public.sale_subcategories (category_id, slug, name, sort_order)
SELECT id, 'office-items', 'Office items', 5 FROM sale_categories WHERE slug = 'other' LIMIT 1
ON CONFLICT (category_id, slug) DO NOTHING;

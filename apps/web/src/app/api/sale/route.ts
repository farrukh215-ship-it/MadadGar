import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category') || null;
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null;
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null;

  const supabase = await createClient();
  let query = supabase
    .from('sale_listings')
    .select('id, title, price, description, images, area_text, phone, created_at, category_id, author_id')
    .order('created_at', { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase.from('sale_categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (priceMin != null && !isNaN(priceMin)) query = query.gte('price', priceMin);
  if (priceMax != null && !isNaN(priceMax)) query = query.lte('price', priceMax);

  const { data: listings, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const catIds = [...new Set((listings ?? []).map((l: { category_id: string }) => l.category_id))];
  const { data: cats } = await supabase.from('sale_categories').select('id, slug, name, icon').in('id', catIds);
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));

  const items = (listings ?? []).map((l: Record<string, unknown>) => {
    const cat = catMap[l.category_id as string];
    return {
      ...l,
      category_name: cat?.name,
      category_slug: cat?.slug,
      category_icon: cat?.icon,
    };
  });

  return Response.json({ items });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? '').trim();
  const categoryId = body.category_id;
  const price = parseFloat(body.price);
  if (!title || !categoryId || isNaN(price)) {
    return Response.json({ error: 'Title, category and price required' }, { status: 400 });
  }

  const images = Array.isArray(body.images) ? body.images.slice(0, 5) : [];
  const { data, error } = await supabase
    .from('sale_listings')
    .insert({
      author_id: user.id,
      title,
      category_id: categoryId,
      price,
      description: body.description || null,
      images,
      area_text: body.area_text || null,
      phone: body.phone || null,
    })
    .select('id')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ listing: data });
}

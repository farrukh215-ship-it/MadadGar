import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category') || null;
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null;
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null;

  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('id, name, price_min, price_max, description, images, link_url, created_at, category_id')
    .order('created_at', { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase.from('product_categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (priceMin != null) query = query.gte('price_max', priceMin);
  if (priceMax != null) query = query.lte('price_min', priceMax);

  const { data: products, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const catIds = [...new Set((products ?? []).map((p: { category_id: string }) => p.category_id))];
  const { data: cats } = await supabase.from('product_categories').select('id, slug, name, icon').in('id', catIds);
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));

  const items = (products ?? []).map((p: Record<string, unknown>) => {
    const cat = catMap[p.category_id as string];
    return {
      ...p,
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
  const name = String(body.name ?? '').trim();
  const categoryId = body.category_id;
  if (!name || !categoryId) {
    return Response.json({ error: 'Name and category required' }, { status: 400 });
  }

  const images = Array.isArray(body.images) ? body.images.slice(0, 3) : [];
  const { data, error } = await supabase
    .from('products')
    .insert({
      author_id: user.id,
      name,
      category_id: categoryId,
      price_min: body.price_min ?? null,
      price_max: body.price_max ?? null,
      description: body.description || null,
      link_url: body.link_url || null,
      images,
    })
    .select('id')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ product: data });
}

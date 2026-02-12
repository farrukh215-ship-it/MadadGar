import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category') || null;
  const subcategoryId = searchParams.get('subcategory_id') || null;
  const priceMin = searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null;
  const priceMax = searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null;
  const city = searchParams.get('city') || null;

  const supabase = await createClient();
  let query = supabase
    .from('sale_listings')
    .select('id, title, price, description, images, area_text, phone, created_at, category_id, subcategory_id, author_id')
    .order('created_at', { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase.from('sale_categories').select('id').eq('slug', categorySlug).single();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (subcategoryId) query = query.eq('subcategory_id', subcategoryId);
  if (priceMin != null && !isNaN(priceMin)) query = query.gte('price', priceMin);
  if (priceMax != null && !isNaN(priceMax)) query = query.lte('price', priceMax);
  if (city && city.trim()) query = query.ilike('area_text', '%' + city.trim() + '%');

  const { data: listings, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const catIds = [...new Set((listings ?? []).map((l: { category_id: string }) => l.category_id))];
  const { data: cats } = await supabase.from('sale_categories').select('id, slug, name, icon').in('id', catIds);
  const catMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));

  const subIds = [...new Set((listings ?? []).map((l: { subcategory_id?: string | null }) => l.subcategory_id).filter(Boolean))] as string[];
  const { data: subs } = subIds.length > 0 ? await supabase.from('sale_subcategories').select('id, slug, name').in('id', subIds) : { data: [] };
  const subMap = Object.fromEntries((subs ?? []).map((s) => [s.id, s]));

  const items = (listings ?? []).map((l: Record<string, unknown>) => {
    const cat = catMap[l.category_id as string];
    const sub = l.subcategory_id ? subMap[l.subcategory_id as string] : null;
    return {
      ...l,
      category_name: cat?.name,
      category_slug: cat?.slug,
      category_icon: cat?.icon,
      subcategory_name: sub?.name,
      subcategory_slug: sub?.slug,
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
  const subcategoryId = body.subcategory_id || null;
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
      subcategory_id: subcategoryId,
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

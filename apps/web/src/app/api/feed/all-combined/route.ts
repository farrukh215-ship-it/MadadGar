import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '31.52');
  const lng = parseFloat(searchParams.get('lng') ?? '74.35');
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);

  const supabase = await createClient();

  const [postsRes, productsData, saleData] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/rpc/feed_nearby`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ p_lat: lat, p_lng: lng, p_radius: 100000, p_limit: limit }),
    }).then((r) => r.json()).catch(() => []),
    supabase.from('products').select('id, name, price_min, price_max, images, link_url, created_at, category_id').order('created_at', { ascending: false }).limit(limit),
    supabase.from('sale_listings').select('id, title, price, images, area_text, phone, created_at, category_id, author_id').order('created_at', { ascending: false }).limit(limit),
  ]);

  const posts = Array.isArray(postsRes) ? postsRes : [];
  const authorIds = [...new Set(posts.map((p: { author_id: string }) => p.author_id))];
  const { data: profiles } = await supabase.from('profiles').select('user_id, display_name').in('user_id', authorIds);
  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name || 'User']));

  const postItems = posts.map((p: Record<string, unknown>) => ({
    ...p,
    item_type: 'post',
    author_name: nameMap[p.author_id as string] ?? 'User',
  }));

  const productCatIds = [...new Set((productsData.data ?? []).map((p: { category_id: string }) => p.category_id).filter(Boolean))];
  const saleCatIds = [...new Set((saleData.data ?? []).map((s: { category_id: string }) => s.category_id).filter(Boolean))];
  const [{ data: productCats }, { data: saleCats }] = await Promise.all([
    productCatIds.length ? supabase.from('product_categories').select('id, name, slug').in('id', productCatIds) : { data: [] },
    saleCatIds.length ? supabase.from('sale_categories').select('id, name, slug').in('id', saleCatIds) : { data: [] },
  ]);
  const productCatMap = Object.fromEntries((productCats ?? []).map((c) => [c.id, { name: c.name, slug: c.slug }]));
  const saleCatMap = Object.fromEntries((saleCats ?? []).map((c) => [c.id, { name: c.name, slug: c.slug }]));

  const productItems = (productsData.data ?? []).map((p: Record<string, unknown>) => {
    const cat = productCatMap[p.category_id as string];
    return {
      ...p,
      item_type: 'product',
      category_name: cat?.name,
      category_slug: cat?.slug,
    };
  });

  const saleItems = (saleData.data ?? []).map((s: Record<string, unknown>) => {
    const cat = saleCatMap[s.category_id as string];
    return {
      ...s,
      item_type: 'sale',
      category_name: cat?.name,
      category_slug: cat?.slug,
    };
  });

  const all = [...postItems, ...productItems, ...saleItems].sort(
    (a, b) => new Date((b.created_at as string) ?? 0).getTime() - new Date((a.created_at as string) ?? 0).getTime()
  );

  return Response.json({ items: all.slice(0, limit * 2) });
}

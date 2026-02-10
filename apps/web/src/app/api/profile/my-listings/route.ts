import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [salesRes, productsRes] = await Promise.all([
    supabase
      .from('sale_listings')
      .select('id, title, price, description, images, area_text, created_at, category_id')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('products')
      .select('id, name, price_min, price_max, images, created_at, category_id')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const saleCatIds = [...new Set((salesRes.data ?? []).map((s: { category_id: string }) => s.category_id))];
  const prodCatIds = [...new Set((productsRes.data ?? []).map((p: { category_id: string }) => p.category_id))];

  const { data: saleCats } = await supabase.from('sale_categories').select('id, slug, name').in('id', saleCatIds);
  const { data: prodCats } = await supabase.from('product_categories').select('id, slug, name').in('id', prodCatIds);

  const saleCatMap = Object.fromEntries((saleCats ?? []).map((c) => [c.id, c]));
  const prodCatMap = Object.fromEntries((prodCats ?? []).map((c) => [c.id, c]));

  const sales = (salesRes.data ?? []).map((s: Record<string, unknown>) => {
    const cat = saleCatMap[s.category_id as string];
    return { ...s, category_name: cat?.name, category_slug: cat?.slug };
  });
  const products = (productsRes.data ?? []).map((p: Record<string, unknown>) => {
    const cat = prodCatMap[p.category_id as string];
    return { ...p, category_name: cat?.name, category_slug: cat?.slug };
  });

  return NextResponse.json({ sales, products });
}

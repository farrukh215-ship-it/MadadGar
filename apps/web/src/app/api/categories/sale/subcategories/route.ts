import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('category') || searchParams.get('category_slug');
  const categoryId = searchParams.get('category_id');

  const supabase = await createClient();
  let catId = categoryId;

  if (!catId && categorySlug) {
    const { data: cat } = await supabase.from('sale_categories').select('id').eq('slug', categorySlug).single();
    catId = cat?.id;
  }
  if (!catId) {
    return Response.json({ subcategories: [] });
  }

  const { data, error } = await supabase
    .from('sale_subcategories')
    .select('id, slug, name, sort_order')
    .eq('category_id', catId)
    .order('sort_order', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ subcategories: data ?? [] });
}

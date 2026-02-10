import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, price_min, price_max, description, images, link_url, created_at, category_id, author_id')
    .eq('id', id)
    .single();

  if (error || !product) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: cat } = await supabase.from('product_categories').select('id, slug, name, icon').eq('id', product.category_id).single();

  return Response.json({
    ...product,
    category_name: cat?.name,
    category_slug: cat?.slug,
    category_icon: cat?.icon,
  });
}

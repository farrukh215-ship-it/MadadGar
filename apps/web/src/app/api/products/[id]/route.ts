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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: existing } = await supabase.from('products').select('author_id').eq('id', id).single();
  if (!existing || existing.author_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.price_min !== undefined) updates.price_min = body.price_min != null ? parseFloat(body.price_min) : null;
  if (body.price_max !== undefined) updates.price_max = body.price_max != null ? parseFloat(body.price_max) : null;
  if (body.description !== undefined) updates.description = body.description ?? null;
  if (body.link_url !== undefined) updates.link_url = body.link_url ?? null;
  if (Array.isArray(body.images)) updates.images = body.images.slice(0, 3);

  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select('id').single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ product: data });
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 });

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from('sale_listings')
    .select('id, title, price, description, images, area_text, phone, created_at, category_id, subcategory_id, author_id')
    .eq('id', id)
    .single();

  if (error || !listing) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: cat } = await supabase.from('sale_categories').select('id, slug, name, icon').eq('id', listing.category_id).single();
  const { data: sub } = listing.subcategory_id
    ? await supabase.from('sale_subcategories').select('id, slug, name').eq('id', listing.subcategory_id).single()
    : { data: null };
  const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', listing.author_id).single();

  return Response.json({
    ...listing,
    category_name: cat?.name,
    category_slug: cat?.slug,
    category_icon: cat?.icon,
    subcategory_name: sub?.name,
    subcategory_slug: sub?.slug,
    author_name: profile?.display_name ?? 'User',
    is_owner: user?.id === listing.author_id,
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

  const { data: existing } = await supabase.from('sale_listings').select('author_id').eq('id', id).single();
  if (!existing || existing.author_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = String(body.title).trim();
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.subcategory_id !== undefined) updates.subcategory_id = body.subcategory_id ?? null;
  if (body.price !== undefined) updates.price = parseFloat(body.price);
  if (body.description !== undefined) updates.description = body.description ?? null;
  if (body.area_text !== undefined) updates.area_text = body.area_text ?? null;
  if (body.phone !== undefined) updates.phone = body.phone ?? null;
  if (Array.isArray(body.images)) updates.images = body.images.slice(0, 5);

  const { data, error } = await supabase.from('sale_listings').update(updates).eq('id', id).select('id').single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ listing: data });
}

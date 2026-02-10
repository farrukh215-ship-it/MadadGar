import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ items: [] });

  const { data, error } = await supabase
    .from('favorites')
    .select('id, item_type, item_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const itemType = body.item_type;
  const itemId = body.item_id;
  if (!itemType || !itemId) return Response.json({ error: 'item_type and item_id required' }, { status: 400 });
  if (!['post', 'product', 'sale'].includes(itemType)) return Response.json({ error: 'Invalid item_type' }, { status: 400 });

  const { error } = await supabase.from('favorites').upsert(
    { user_id: user.id, item_type: itemType, item_id: itemId },
    { onConflict: 'user_id,item_type,item_id' }
  );
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ saved: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const itemType = searchParams.get('item_type');
  const itemId = searchParams.get('item_id');
  if (!itemType || !itemId) return Response.json({ error: 'item_type and item_id required' }, { status: 400 });

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('item_type', itemType)
    .eq('item_id', itemId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ removed: true });
}

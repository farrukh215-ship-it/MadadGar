import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ blocked: [] });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (userId) {
    const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id).eq('blocked_id', userId).single();
    return Response.json({ is_blocked: !!data });
  }
  const { data } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', user.id);
  return Response.json({ blocked: (data ?? []).map((b) => b.blocked_id) });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const blockedId = body.user_id;
  if (!blockedId) return Response.json({ error: 'user_id required' }, { status: 400 });
  if (blockedId === user.id) return Response.json({ error: 'Cannot block yourself' }, { status: 400 });

  const { error } = await supabase.from('blocks').upsert(
    { blocker_id: user.id, blocked_id: blockedId },
    { onConflict: 'blocker_id,blocked_id' }
  );
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ blocked: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const blockedId = searchParams.get('user_id');
  if (!blockedId) return Response.json({ error: 'user_id required' }, { status: 400 });

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', user.id)
    .eq('blocked_id', blockedId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ unblocked: true });
}

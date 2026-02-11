import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, created_at')
    .eq('to_user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const fromIds = [...new Set((data ?? []).map((r) => r.from_user_id))];
  if (fromIds.length === 0) {
    return Response.json({ requests: [] });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', fromIds);

  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, { display_name: p.display_name || 'User', avatar_url: p.avatar_url }]));

  const requests = (data ?? []).map((r) => ({
    id: r.id,
    from_user_id: r.from_user_id,
    from_name: nameMap[r.from_user_id]?.display_name ?? 'User',
    from_avatar: nameMap[r.from_user_id]?.avatar_url ?? null,
    created_at: r.created_at,
  }));

  return Response.json({ requests });
}

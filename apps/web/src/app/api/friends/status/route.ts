import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const target_id = searchParams.get('user_id');
  if (!target_id) {
    return Response.json({ error: 'user_id required' }, { status: 400 });
  }

  if (target_id === user.id) {
    return Response.json({ status: 'self' });
  }

  const { data: friendRow } = await supabase
    .from('friends')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('friend_id', target_id)
    .maybeSingle();

  if (friendRow) {
    return Response.json({ status: 'friends' });
  }

  const { data: req } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, status')
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${target_id}),and(from_user_id.eq.${target_id},to_user_id.eq.${user.id})`)
    .maybeSingle();

  if (req) {
    if (req.status === 'pending') {
      return Response.json({ status: req.from_user_id === user.id ? 'pending_sent' : 'pending_received', request_id: req.id });
    }
    if (req.status === 'accepted') return Response.json({ status: 'friends' });
  }

  return Response.json({ status: 'none' });
}

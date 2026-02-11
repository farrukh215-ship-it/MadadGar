import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const request_id = body.request_id as string | undefined;
  if (!request_id) {
    return Response.json({ error: 'request_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'declined' })
    .eq('id', request_id)
    .eq('to_user_id', user.id)
    .eq('status', 'pending');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

  const { data: req, error: fetchErr } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, to_user_id')
    .eq('id', request_id)
    .eq('to_user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (fetchErr || !req) {
    return Response.json({ error: 'Request not found' }, { status: 404 });
  }

  const { error: updateErr } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted' })
    .eq('id', request_id);

  if (updateErr) {
    return Response.json({ error: updateErr.message }, { status: 500 });
  }

  await supabase.from('friends').insert([
    { user_id: user.id, friend_id: req.from_user_id },
    { user_id: req.from_user_id, friend_id: user.id },
  ]);

  const { data: accepterProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .single();

  const accepterName = accepterProfile?.display_name || 'Someone';
  try {
    const admin = createAdminClient();
    await admin.from('notifications').insert({
      user_id: req.from_user_id,
      type: 'friend_accepted',
      title: 'Friend request accepted',
      body: `${accepterName} accepted your friend request`,
      link: '/chat/friends',
    });
  } catch {
    // ignore if admin not configured
  }

  return Response.json({ ok: true });
}

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
  const to_user_id = body.to_user_id as string | undefined;
  if (!to_user_id || to_user_id === user.id) {
    return Response.json({ error: 'Invalid user' }, { status: 400 });
  }

  // Enforce at least 1 shared interest before allowing friend requests
  try {
    const [{ data: myInterests }, { data: theirInterests }] = await Promise.all([
      supabase.from('user_interests').select('interest_slug').eq('user_id', user.id),
      supabase.from('user_interests').select('interest_slug').eq('user_id', to_user_id),
    ]);
    const mySet = new Set((myInterests ?? []).map((r) => r.interest_slug as string));
    let shared = 0;
    for (const r of theirInterests ?? []) {
      if (mySet.has(r.interest_slug as string)) {
        shared++;
        if (shared >= 1) break;
      }
    }
    if (shared < 1) {
      return Response.json(
        {
          error: 'At least 1 shared interest required to send friend request.',
          code: 'shared_interests_minimum',
          shared_count: shared,
          required: 1,
        },
        { status: 403 },
      );
    }
  } catch {
    // If interests lookup fails, fall back to allowing the request
  }

  const { data: existing } = await supabase
    .from('friend_requests')
    .select('id, status')
    .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${to_user_id}),and(from_user_id.eq.${to_user_id},to_user_id.eq.${user.id})`)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'accepted') {
      return Response.json({ error: 'Already friends' }, { status: 400 });
    }
    if (existing.status === 'pending') {
      return Response.json({ error: 'Request already pending' }, { status: 400 });
    }
  }

  const { data: alreadyFriends } = await supabase
    .from('friends')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('friend_id', to_user_id)
    .maybeSingle();

  if (alreadyFriends) {
    return Response.json({ error: 'Already friends' }, { status: 400 });
  }

  const { error } = await supabase.from('friend_requests').upsert(
    { from_user_id: user.id, to_user_id, status: 'pending' },
    { onConflict: 'from_user_id,to_user_id' }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  try {
    const { data: pref } = await supabase.from('notification_preferences').select('friend_requests').eq('user_id', to_user_id).single();
    if ((pref as { friend_requests?: boolean } | null)?.friend_requests === false) return Response.json({ ok: true });
    const { data: fromProfile } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).single();
    const admin = createAdminClient();
    await admin.from('notifications').insert({
      user_id: to_user_id,
      type: 'friend_request',
      title: 'Friend request',
      body: `${fromProfile?.display_name || 'Someone'} wants to add you as a friend`,
      link: '/chat/friends',
    });
  } catch {
    // ignore if admin not configured
  }

  return Response.json({ ok: true });
}

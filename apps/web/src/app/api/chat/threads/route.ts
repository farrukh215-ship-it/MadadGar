import { NextRequest } from 'next/server';
import { createClientFromRequest } from '@/lib/supabase/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = await createClientFromRequest(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: participants } = await supabase
    .from('chat_participants')
    .select('thread_id')
    .eq('user_id', user.id);

  const threadIds = [...new Set((participants ?? []).map((p) => p.thread_id))];
  if (threadIds.length === 0) {
    const { data: myInt } = await supabase.from('user_interests').select('interest_slug').eq('user_id', user.id);
    const { data: interestCats } = await supabase.from('interest_categories').select('slug, name, icon');
    const interestMap = Object.fromEntries((interestCats ?? []).map((c) => [c.slug, { name: c.name, icon: c.icon ?? '' }]));
    return Response.json({ threads: [], my_interests: (myInt ?? []).map((r) => r.interest_slug), interest_map: interestMap });
  }

  const { data: threads } = await supabase
    .from('chat_threads')
    .select('id, post_id, updated_at')
    .in('id', threadIds)
    .order('updated_at', { ascending: false });

  const postIds = [...new Set((threads ?? []).map((t) => t.post_id).filter(Boolean))] as string[];
  let postsMap: Record<string, { worker_name: string | null; category_name: string }> = {};

  if (postIds.length > 0) {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, worker_name, category_id')
      .in('id', postIds);

    if (posts?.length) {
      const categoryIds = [...new Set(posts.map((p) => p.category_id))];
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);

      const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));
      postsMap = Object.fromEntries(
        (posts ?? []).map((p) => [
          p.id,
          { worker_name: p.worker_name, category_name: catMap[p.category_id] ?? '' },
        ])
      );
    }
  }

  const directThreadIds = (threads ?? []).filter((t) => !t.post_id).map((t) => t.id);
  let directTitles: Record<string, string> = {};
  let otherUserByThread: Record<string, string> = {};
  let otherUserProfile: Record<string, { display_name: string; avatar_url: string | null; gender: string | null; age: number | null; marital_status: string | null }> = {};
  let sharedInterestsByOtherId: Record<string, string[]> = {};
  let unreadByThread: Record<string, number> = {};
  if (directThreadIds.length > 0) {
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('thread_id, user_id')
      .in('thread_id', directThreadIds);
    const otherIds = [...new Set((participants ?? []).map((p) => p.user_id).filter((uid) => uid !== user.id))];
    if (otherIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url, gender, date_of_birth, marital_status')
        .in('user_id', otherIds);
      for (const p of participants ?? []) {
        if (p.user_id !== user.id) {
          const profile = (profiles ?? []).find((pr) => pr.user_id === p.user_id);
          const age = profile?.date_of_birth
            ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null;
          directTitles[p.thread_id] = profile?.display_name || 'User';
          otherUserByThread[p.thread_id] = p.user_id;
          otherUserProfile[p.user_id] = {
            display_name: profile?.display_name || 'User',
            avatar_url: (profile as { avatar_url?: string | null })?.avatar_url ?? null,
            gender: (profile as { gender?: string }).gender ?? null,
            age: age != null && age >= 0 && age <= 120 ? age : null,
            marital_status: (profile as { marital_status?: string }).marital_status ?? null,
          };
        }
      }
    }
  }
  const { data: friendRows } = await supabase.from('friends').select('friend_id').eq('user_id', user.id);
  const friendIds = new Set((friendRows ?? []).map((r) => r.friend_id));
  const otherIdsForReq = [...new Set(Object.values(otherUserByThread))];
  if (otherIdsForReq.length > 0) {
    const { data: myInt } = await supabase.from('user_interests').select('interest_slug').eq('user_id', user.id);
    const mySlugs = new Set((myInt ?? []).map((r) => r.interest_slug));
    const { data: theirInt } = await supabase.from('user_interests').select('user_id, interest_slug').in('user_id', otherIdsForReq);
    for (const r of theirInt ?? []) {
      if (mySlugs.has(r.interest_slug)) {
        const arr = sharedInterestsByOtherId[r.user_id] ?? [];
        if (!arr.includes(r.interest_slug)) arr.push(r.interest_slug);
        sharedInterestsByOtherId[r.user_id] = arr;
      }
    }
  }
  let pendingSentIds = new Set<string>();
  if (otherIdsForReq.length > 0) {
    const { data: pendingSent } = await supabase
      .from('friend_requests')
      .select('to_user_id')
      .eq('from_user_id', user.id)
      .eq('status', 'pending')
      .in('to_user_id', otherIdsForReq);
    pendingSentIds = new Set((pendingSent ?? []).map((r) => r.to_user_id));
  }
  const { data: unreadRows } = await supabase
    .from('messages')
    .select('thread_id')
    .in('thread_id', threadIds)
    .neq('sender_id', user.id)
    .is('read_at', null);
  for (const r of unreadRows ?? []) {
    unreadByThread[r.thread_id] = (unreadByThread[r.thread_id] ?? 0) + 1;
  }

  const { data: lastMessages } = await supabase
    .from('messages')
    .select('thread_id, content, message_type, sender_id, created_at')
    .in('thread_id', threadIds)
    .order('created_at', { ascending: false });
  const lastByThread: Record<string, { content: string | null; message_type: string; sender_id: string; created_at: string }> = {};
  for (const m of lastMessages ?? []) {
    if (!lastByThread[m.thread_id]) lastByThread[m.thread_id] = m;
  }

  const enriched = (threads ?? []).map((t) => {
    const last = lastByThread[t.id];
    let lastPreview = '';
    if (last) {
      if (last.message_type === 'image') lastPreview = '📷 Photo';
      else if (last.message_type === 'audio') lastPreview = '🎤 Voice';
      else if (last.message_type === 'video') lastPreview = '🎬 Video';
      else if (last.message_type === 'location') lastPreview = '📍 Location';
      else lastPreview = (last.content ?? '').slice(0, 60) + ((last.content ?? '').length > 60 ? '…' : '');
    }
    const otherId = !t.post_id ? otherUserByThread[t.id] : null;
    const profile = otherId ? otherUserProfile[otherId] : null;
    return {
    id: t.id,
    updated_at: t.updated_at,
    post_id: t.post_id,
    title: t.post_id
      ? `${postsMap[t.post_id]?.worker_name || 'Helper'} — ${postsMap[t.post_id]?.category_name || 'Service'}`
      : (directTitles[t.id] ?? 'Chat'),
    unread_count: unreadByThread[t.id] ?? 0,
    last_message: lastPreview || null,
    is_friend: !!otherId && friendIds.has(otherId),
    friend_request_sent: !!otherId && pendingSentIds.has(otherId),
    other_user: profile ? { id: otherId, display_name: profile.display_name, avatar_url: profile.avatar_url, gender: profile.gender, age: profile.age, marital_status: profile.marital_status, shared_interests: otherId ? (sharedInterestsByOtherId[otherId] ?? []) : [] } : null,
  };
  });

  const { data: myInt } = await supabase.from('user_interests').select('interest_slug').eq('user_id', user.id);
  const myInterests = (myInt ?? []).map((r) => r.interest_slug);

  const { data: interestCats } = await supabase.from('interest_categories').select('slug, name, icon');
  const interestMap = Object.fromEntries((interestCats ?? []).map((c) => [c.slug, { name: c.name, icon: c.icon ?? '' }]));

  return Response.json({ threads: enriched, my_interests: myInterests, interest_map: interestMap });
}

export async function POST(request: NextRequest) {
  const supabase = await createClientFromRequest(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { post_id, user_id: target_user_id, source } = body as { post_id?: string; user_id?: string; source?: string };

  let otherUserId: string;

  if (target_user_id) {
    otherUserId = target_user_id;
  } else if (post_id) {
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', post_id)
      .single();

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }
    otherUserId = post.author_id;
  } else {
    return Response.json({ error: 'post_id or user_id required' }, { status: 400 });
  }
  if (otherUserId === user.id) {
    return Response.json({ error: 'Cannot chat with yourself' }, { status: 400 });
  }

  // If chat is coming from Yaari, enforce at least 1 shared interest
  if (source === 'interests') {
    try {
      const [{ data: myInterests }, { data: theirInterests }] = await Promise.all([
        supabase.from('user_interests').select('interest_slug').eq('user_id', user.id),
        supabase.from('user_interests').select('interest_slug').eq('user_id', otherUserId),
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
            error: 'At least 1 shared interest required to chat from Yaari.',
            code: 'shared_interests_minimum',
            shared_count: shared,
            required: 1,
          },
          { status: 403 },
        );
      }
    } catch {
      // If interests lookup fails, fall back to allowing the chat
    }
  }

  await supabase.from('chat_contacts').upsert(
    { user_id: user.id, contact_id: otherUserId },
    { onConflict: 'user_id,contact_id' }
  );

  const { data: participants } = await supabase
    .from('chat_participants')
    .select('thread_id')
    .or(`user_id.eq.${user.id},user_id.eq.${otherUserId}`);

  const threadIds = [...new Set((participants ?? []).map((p) => p.thread_id))];
  for (const tid of threadIds) {
    const { data: pts } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('thread_id', tid);
    const userIds = (pts ?? []).map((p) => p.user_id);
    if (userIds.includes(user.id) && userIds.includes(otherUserId)) {
      const { data: t } = await supabase.from('chat_threads').select('post_id').eq('id', tid).single();
      if (post_id && t?.post_id === post_id) return Response.json({ thread: { id: tid } });
      if (!post_id && !t?.post_id) return Response.json({ thread: { id: tid } });
    }
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json({
      error: 'Chat unavailable. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase Dashboard > Settings > API)',
    }, { status: 500 });
  }

  const { data: thread, error: threadErr } = await admin
    .from('chat_threads')
    .insert({ post_id: post_id ?? null })
    .select('id')
    .single();

  if (threadErr || !thread) {
    return Response.json({ error: threadErr?.message ?? 'Failed to create chat' }, { status: 500 });
  }

  const { error: participantsErr } = await admin.from('chat_participants').insert([
    { thread_id: thread.id, user_id: user.id, role: 'seeker' },
    { thread_id: thread.id, user_id: otherUserId, role: 'poster' },
  ]);

  if (participantsErr) {
    return Response.json({ error: participantsErr.message ?? 'Failed to add participants' }, { status: 500 });
  }

  return Response.json({ thread });
}

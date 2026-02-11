import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const supabase = await createClient();
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
    return Response.json({ threads: [] });
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
        .select('user_id, display_name')
        .in('user_id', otherIds);
      const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name || 'User']));
      for (const p of participants ?? []) {
        if (p.user_id !== user.id) {
          directTitles[p.thread_id] = nameMap[p.user_id] ?? 'User';
        }
      }
    }
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
    return {
    id: t.id,
    updated_at: t.updated_at,
    post_id: t.post_id,
    title: t.post_id
      ? `${postsMap[t.post_id]?.worker_name || 'Helper'} — ${postsMap[t.post_id]?.category_name || 'Service'}`
      : (directTitles[t.id] ?? 'Chat'),
    unread_count: unreadByThread[t.id] ?? 0,
    last_message: lastPreview || null,
  };
  });

  return Response.json({ threads: enriched });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { post_id, user_id: target_user_id } = body;

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

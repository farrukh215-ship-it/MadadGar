import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  if (!postId) {
    return Response.json({ error: 'Post ID required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from('post_comments')
    .select('id, user_id, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  let userMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);
    userMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.user_id, p.display_name || 'User'])
    );
  }

  const items = (comments ?? []).map((c) => ({
    id: c.id,
    user_id: c.user_id,
    user_name: userMap[c.user_id] ?? 'User',
    content: c.content,
    created_at: c.created_at,
  }));

  return Response.json({ items });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  if (!postId) {
    return Response.json({ error: 'Post ID required' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const content = String(body.content ?? '').trim();
  if (!content) {
    return Response.json({ error: 'Content required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: user.id, content })
    .select('id, content, created_at')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', user.id)
    .single();

  return Response.json({
    comment: {
      id: data.id,
      user_id: user.id,
      user_name: profile?.display_name || 'User',
      content: data.content,
      created_at: data.created_at,
    },
  });
}

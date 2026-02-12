import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ratingId: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: postId, ratingId } = await params;
  if (!postId || !ratingId) return Response.json({ error: 'Missing params' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const reply = typeof body.reply === 'string' ? body.reply.trim().slice(0, 500) : '';

  const { data: post } = await supabase
    .from('posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (!post || post.author_id !== user.id) {
    return Response.json({ error: 'Only post author can reply' }, { status: 403 });
  }

  const { error } = await supabase
    .from('ratings')
    .update({
      worker_reply: reply || null,
      worker_reply_at: reply ? new Date().toISOString() : null,
    })
    .eq('id', ratingId)
    .eq('post_id', postId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

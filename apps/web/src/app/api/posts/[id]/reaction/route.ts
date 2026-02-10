import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  if (!postId) {
    return Response.json({ error: 'Post ID required' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const reaction = body.reaction === 'dislike' ? 'dislike' : 'like';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('post_reactions')
    .upsert(
      { post_id: postId, user_id: user.id, reaction },
      { onConflict: 'post_id,user_id' }
    );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const [{ count: likeTotal }, { count: dislikeTotal }] = await Promise.all([
    supabase.from('post_reactions').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reaction', 'like'),
    supabase.from('post_reactions').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reaction', 'dislike'),
  ]);

  return Response.json({
    reaction,
    like_count: likeTotal ?? 0,
    dislike_count: dislikeTotal ?? 0,
  });
}

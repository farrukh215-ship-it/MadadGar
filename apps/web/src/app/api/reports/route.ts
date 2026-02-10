import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const postId = body.post_id;
  const reason = body.reason || 'Inappropriate content';
  if (!postId) return Response.json({ error: 'post_id required' }, { status: 400 });

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id: postId,
    reason,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ reported: true });
}

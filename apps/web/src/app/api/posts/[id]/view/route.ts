import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  if (!postId) return Response.json({ error: 'Post ID required' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('post_views').insert({
    post_id: postId,
    user_id: user?.id ?? null,
  });

  return Response.json({ ok: true });
}

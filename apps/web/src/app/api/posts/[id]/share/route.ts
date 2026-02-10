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
  const sharedWithId = body.shared_with_id ?? null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('post_shares')
    .insert({
      post_id: postId,
      sharer_id: user.id,
      shared_with_id: sharedWithId || null,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const forwarded = request.headers.get('x-forwarded-host');
  const host = request.headers.get('host') || forwarded;
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://madadgar.app');
  const shareUrl = `${baseUrl}/post/${postId}`;

  return Response.json({
    shared: true,
    share_url: shareUrl,
  });
}

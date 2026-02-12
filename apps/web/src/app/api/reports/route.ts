import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getReportThresholds } from '@/lib/spamDetector';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const postId = body.post_id as string | undefined;
  const userId = body.user_id as string | undefined;
  const reason = (body.reason as string | undefined) || 'Inappropriate content';

  if (!postId && !userId) {
    return Response.json({ error: 'post_id or user_id required' }, { status: 400 });
  }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id: postId || null,
    user_id: userId || null,
    reason,
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  if (postId) {
    const { count } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const { shadowHide } = getReportThresholds();
    if (count != null && count >= shadowHide) {
      try {
        const admin = createAdminClient();
        await admin.from('posts').update({ shadow_hidden: true }).eq('id', postId);
      } catch {
        // Admin client not configured
      }
    }
  }

  return Response.json({ reported: true });
}

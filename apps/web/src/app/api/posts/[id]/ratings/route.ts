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
  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      id,
      rating,
      review_text,
      created_at,
      rater_id
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const raterIds = [...new Set((ratings ?? []).map((r) => r.rater_id))];
  let raterMap: Record<string, string> = {};
  if (raterIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', raterIds);
    raterMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.user_id, p.display_name || 'User'])
    );
  }

  const items = (ratings ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    review_text: r.review_text,
    created_at: r.created_at,
    rater_name: raterMap[r.rater_id] ?? 'User',
  }));

  return Response.json({ items });
}

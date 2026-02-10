import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  if (!postId) return Response.json({ error: 'Post ID required' }, { status: 400 });

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from('posts')
    .select('id, author_id, category_id, post_type, worker_name, phone, area_text, reason, relation_tag, intro, images, availability, optional_rate, madad_count, created_at')
    .eq('id', postId)
    .single();

  if (error || !post) {
    return Response.json({ error: 'Post not found' }, { status: 404 });
  }

  const { data: category } = await supabase.from('categories').select('name').eq('id', post.category_id).single();

  const [{ data: profile }, { data: ratings }, { data: reactions }] = await Promise.all([
    supabase.from('profiles').select('display_name, verified').eq('user_id', post.author_id).single(),
    supabase.from('ratings').select('rating, review_text, created_at, rater_id').eq('post_id', postId).order('created_at', { ascending: false }).limit(20),
    supabase.from('post_reactions').select('reaction').eq('post_id', postId),
  ]);

  const likeCount = reactions?.filter((r) => r.reaction === 'like').length ?? 0;
  const dislikeCount = reactions?.filter((r) => r.reaction === 'dislike').length ?? 0;
  const avgRating = ratings?.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;

  const raterIds = [...new Set((ratings ?? []).map((r) => r.rater_id))];
  const { data: profiles } = await supabase.from('profiles').select('user_id, display_name').in('user_id', raterIds);
  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name || 'User']));

  const reviews = (ratings ?? []).map((r) => ({
    ...r,
    rater_name: nameMap[r.rater_id] ?? 'User',
  }));

  return Response.json({
    post: {
      ...post,
      category_name: category?.name ?? 'Category',
      author_name: profile?.display_name ?? 'User',
      author_verified: profile?.verified ?? false,
      like_count: likeCount,
      dislike_count: dislikeCount,
      avg_rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      reviews_count: reviews.filter((r) => r.review_text).length,
      reviews,
    },
  });
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id, author_id, category_id, post_type, worker_name, phone, area_text,
      reason, relation_tag, intro, images, availability, optional_rate,
      madad_count, created_at
    `)
    .eq('author_id', userId)
    .eq('shadow_hidden', false)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const categoryIds = [...new Set((posts ?? []).map((p) => p.category_id).filter(Boolean))];
  let categoryMap: Record<string, string> = {};
  if (categoryIds.length > 0) {
    const { data: cats } = await supabase.from('categories').select('id, name').in('id', categoryIds);
    categoryMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c.name]));
  }

  const postIds = (posts ?? []).map((p) => p.id);
  let avgRatings: Record<string, number> = {};
  let recCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: ratings } = await supabase.from('ratings').select('post_id, rating');
    const { data: recs } = await supabase.from('recommendations').select('post_id');
    for (const p of postIds) {
      const rList = (ratings ?? []).filter((r) => r.post_id === p);
      avgRatings[p] = rList.length ? rList.reduce((a, r) => a + r.rating, 0) / rList.length : 0;
      recCounts[p] = (recs ?? []).filter((r) => r.post_id === p).length;
    }
  }

  const items = (posts ?? []).map((p) => ({
    id: p.id,
    author_id: p.author_id,
    category_id: p.category_id,
    category_name: categoryMap[p.category_id] ?? '',
    post_type: p.post_type,
    worker_name: p.worker_name,
    phone: p.phone,
    area_text: p.area_text,
    reason: p.reason,
    relation_tag: p.relation_tag,
    intro: p.intro,
    images: p.images ?? [],
    availability: p.availability ?? true,
    optional_rate: p.optional_rate,
    madad_count: p.madad_count ?? 0,
    created_at: p.created_at,
    avg_rating: avgRatings[p.id] ?? null,
    rec_count: recCounts[p.id] ?? 0,
  }));

  return Response.json({ items });
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Predictive Analytics & Insights - Trending
 * Returns trending categories, top helpers, popular in area
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || null;
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .order('sort_order');

  const { data: postCounts } = await supabase
    .from('posts')
    .select('category_id')
    .eq('shadow_hidden', false);

  const catCount: Record<string, number> = {};
  for (const p of postCounts ?? []) {
    if (p.category_id) {
      catCount[p.category_id] = (catCount[p.category_id] ?? 0) + 1;
    }
  }

  const catMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  const trending = Object.entries(catCount)
    .map(([catId, count]) => ({
      category_id: catId,
      category_name: catMap[catId]?.name ?? 'Unknown',
      category_slug: catMap[catId]?.slug,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  const { data: topPosts } = await supabase
    .from('posts')
    .select('id, worker_name, category_id, madad_count, created_at')
    .eq('shadow_hidden', false)
    .order('madad_count', { ascending: false })
    .limit(limit);

  const topHelpers = (topPosts ?? []).map((p) => ({
    id: p.id,
    worker_name: p.worker_name,
    category_name: catMap[p.category_id]?.name,
    madad_count: p.madad_count ?? 0,
    href: `/post/${p.id}`,
  }));

  return Response.json({
    trending_categories: trending,
    top_helpers: topHelpers,
    message: city ? `Trending in ${city}` : 'Trending across Madadgar',
  });
}

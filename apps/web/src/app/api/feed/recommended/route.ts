import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClientFromRequest } from '@/lib/supabase/api-auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Smart Content Recommendation
 * Personalizes feed: recency (0.4) + relevance/trust (0.3) + user interests (0.2) + social proof (0.1)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClientFromRequest(request);
  const { data: { user } } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '31.52');
  const lng = parseFloat(searchParams.get('lng') ?? '74.35');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 50);
  const radius = parseInt(searchParams.get('radius') ?? '50000', 10);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/feed_nearby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    body: JSON.stringify({ p_lat: lat, p_lng: lng, p_radius: radius, p_limit: limit * 2 }),
  });
  const rawItems = await res.json().catch(() => []);
  const items = Array.isArray(rawItems) ? rawItems : [];

  let userInterests = new Set<string>();
  let userFavorites = new Set<string>();
  if (user) {
    const [intRes, favRes] = await Promise.all([
      supabase.from('user_interests').select('interest_slug').eq('user_id', user.id),
      supabase.from('favorites').select('item_type, item_id').eq('user_id', user.id),
    ]);
    userInterests = new Set((intRes.data ?? []).map((r) => r.interest_slug));
    userFavorites = new Set((favRes.data ?? []).map((f) => `${f.item_type}:${f.item_id}`));
  }

  const now = Date.now();
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

  const scored = items.map((item: Record<string, unknown>) => {
    const created = new Date(item.created_at as string).getTime();
    const ageMs = now - created;
    const recency = Math.max(0, 1 - ageMs / MAX_AGE_MS);

    const avgRating = (item.avg_rating as number) ?? 0;
    const trustNorm = Math.min(1, avgRating / 5);

    const madad = (item.madad_count as number) ?? 0;
    const recCount = (item.rec_count as number) ?? 0;
    const socialProof = Math.min(1, (madad + recCount * 2) / 20);

    const categoryName = (item.category_name as string) ?? '';
    const reason = (item.reason as string) ?? '';
    const text = `${categoryName} ${reason}`.toLowerCase();
    let interestMatch = 0;
    for (const int of userInterests) {
      if (text.includes(int.toLowerCase())) interestMatch = 0.2;
    }

    const favKey = `post:${item.id}`;
    const isFav = userFavorites.has(favKey) ? 0.1 : 0;

    const score =
      0.4 * recency +
      0.3 * trustNorm +
      0.2 * interestMatch +
      0.1 * socialProof +
      isFav;

    return { ...item, _score: score };
  });

  scored.sort((a: { _score: number }, b: { _score: number }) => b._score - a._score);

  const filtered = scored
    .map((s) => {
      const { _score, ...rest } = s as Record<string, unknown> & { _score: number };
      return rest as Record<string, unknown>;
    })
    .slice(0, limit);

  const authorIds = [...new Set(filtered.map((i: Record<string, unknown>) => i.author_id as string).filter(Boolean))];
  const serverSupabase = await createClient();
  const { data: profiles } = await serverSupabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', authorIds);
  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name || 'User']));

  const enriched = filtered.map((i: Record<string, unknown>) => ({
    ...i,
    item_type: 'post',
    author_name: nameMap[i.author_id as string] ?? (i.author_name as string) ?? 'User',
  }));

  return Response.json({ items: enriched });
}

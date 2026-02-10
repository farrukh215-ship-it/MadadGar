import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '0');
  const lng = parseFloat(searchParams.get('lng') ?? '0');
  const categoryId = searchParams.get('category') || null;
  const radius = parseInt(searchParams.get('radius') ?? '5000', 10);
  const limit = parseInt(searchParams.get('limit') ?? '50', 10);

  const body: Record<string, number | string | null> = {
    p_lat: lat,
    p_lng: lng,
    p_radius: radius,
    p_limit: limit,
  };
  if (categoryId && categoryId !== 'null') body.p_category_id = categoryId;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/feed_nearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[feed/nearby]', res.status, err);
    return Response.json({ items: [] });
  }

  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  if (items.length === 0) return Response.json({ items: [] });

  const authorIds = [...new Set(items.map((i: { author_id: string }) => i.author_id).filter(Boolean))];
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name')
    .in('user_id', authorIds);
  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.user_id, p.display_name || 'User']));

  const enriched = items.map((i: Record<string, unknown>) => ({
    ...i,
    author_name: nameMap[i.author_id as string] ?? 'User',
  }));
  return Response.json({ items: enriched });
}

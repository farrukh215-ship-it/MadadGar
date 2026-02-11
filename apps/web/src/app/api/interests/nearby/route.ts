import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lng = parseFloat(searchParams.get('lng') ?? '');
  const slug = searchParams.get('slug') ?? '';
  const radius = parseInt(searchParams.get('radius') ?? '10', 10) || 10;

  if (!slug || Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json({ error: 'lat, lng, slug required' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('nearby_users_by_interest', {
    p_lat: lat,
    p_lng: lng,
    p_interest_slug: slug,
    p_radius_km: Math.min(50, Math.max(1, radius)),
    p_limit: 50,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const userIds = (data ?? []).map((u: { user_id: string }) => u.user_id);
  const sharedCounts: Record<string, number> = {};
  if (userIds.length > 0) {
    const { data: myInterests } = await supabase
      .from('user_interests')
      .select('interest_slug')
      .eq('user_id', user.id);
    const mySet = new Set((myInterests ?? []).map((r) => r.interest_slug));
    const { data: theirInterests } = await supabase
      .from('user_interests')
      .select('user_id, interest_slug')
      .in('user_id', userIds);
    for (const r of theirInterests ?? []) {
      if (mySet.has(r.interest_slug)) {
        sharedCounts[r.user_id] = (sharedCounts[r.user_id] ?? 0) + 1;
      }
    }
  }

  const users = (data ?? []).map((u: { user_id: string; display_name: string; avatar_url: string | null; gender: string | null; distance_km: number }) => ({
    id: u.user_id,
    display_name: u.display_name || 'User',
    avatar_url: u.avatar_url,
    gender: u.gender,
    distance_km: Math.round(u.distance_km * 10) / 10,
    shared_count: sharedCounts[u.user_id] ?? 0,
  }));

  return Response.json({ users });
}

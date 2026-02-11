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
  const radius = parseInt(searchParams.get('radius') ?? '10', 10) || 10;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json({ error: 'lat, lng required' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('nearby_users_shared_interests', {
    p_lat: lat,
    p_lng: lng,
    p_radius_km: Math.min(50, Math.max(1, radius)),
    p_limit: 50,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const users = (data ?? []).map((u: { user_id: string; display_name: string; avatar_url: string | null; gender: string | null; distance_km: number; shared_interests: string[] }) => ({
    id: u.user_id,
    display_name: u.display_name || 'User',
    avatar_url: u.avatar_url,
    gender: u.gender,
    distance_km: Math.round(u.distance_km * 10) / 10,
    shared_count: (u.shared_interests ?? []).length,
  }));

  return Response.json({ users });
}

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '31.52');
  const lng = parseFloat(searchParams.get('lng') ?? '74.35');
  const radius = parseInt(searchParams.get('radius') ?? '10000', 10);
  const limit = parseInt(searchParams.get('limit') ?? '100', 10);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/feed_map_markers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      p_lat: lat,
      p_lng: lng,
      p_radius: radius,
      p_limit: limit,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[feed/map]', res.status, err);
    return Response.json({ markers: [] });
  }

  const data = await res.json();
  const markers = Array.isArray(data) ? data : [];
  return Response.json({ markers });
}

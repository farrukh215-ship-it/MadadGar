import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const LIMIT_PER_SECTION = 10;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const interestSlug = searchParams.get('interest') || null;

  // Get users who share interests with current user
  const { data: myInterests } = await supabase
    .from('user_interests')
    .select('interest_slug')
    .eq('user_id', user.id);
  const mySlugs = new Set((myInterests ?? []).map((r) => r.interest_slug));

  let userIds: string[] = [];
  if (interestSlug) {
    const { data: rows } = await supabase
      .from('user_interests')
      .select('user_id')
      .eq('interest_slug', interestSlug)
      .neq('user_id', user.id);
    userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
  } else {
    const { data: rows } = await supabase
      .from('user_interests')
      .select('user_id')
      .neq('user_id', user.id);
    userIds = [...new Set((rows ?? []).map((r) => r.user_id))];
  }

  if (userIds.length === 0) {
    return Response.json({
      male: [],
      female: [],
      most_active: [],
      all: [],
    });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, gender, date_of_birth, marital_status, city')
    .in('user_id', userIds);

  const { data: presenceRows } = await supabase
    .from('user_presence')
    .select('user_id, last_seen_at')
    .in('user_id', userIds);
  const lastSeenMap = new Map(
    (presenceRows ?? []).map((r) => [r.user_id, (r as { last_seen_at?: string }).last_seen_at])
  );

  const { data: interestCounts } = await supabase
    .from('user_interests')
    .select('user_id')
    .in('user_id', userIds);
  const interestCountByUser = new Map<string, number>();
  for (const r of interestCounts ?? []) {
    interestCountByUser.set(r.user_id, (interestCountByUser.get(r.user_id) ?? 0) + 1);
  }

  let premiumRows: { user_id: string }[] = [];
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .in('user_id', userIds)
      .eq('plan', 'premium')
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);
    premiumRows = (data ?? []) as { user_id: string }[];
  } catch {
    premiumRows = [];
  }
  const premiumIds = new Set(premiumRows.map((r) => r.user_id));

  const { data: allTheirInterests } = await supabase
    .from('user_interests')
    .select('user_id, interest_slug')
    .in('user_id', userIds);
  const sharedByUser = new Map<string, number>();
  for (const r of allTheirInterests ?? []) {
    if (mySlugs.has(r.interest_slug)) {
      sharedByUser.set(r.user_id, (sharedByUser.get(r.user_id) ?? 0) + 1);
    }
  }

  const now = new Date();
  const usersList = (profiles ?? []).map((p) => {
    const dob = (p as { date_of_birth?: string }).date_of_birth;
    const age = dob ? Math.floor((now.getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const lastSeen = lastSeenMap.get(p.user_id);
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const isActive = lastSeen ? lastSeen >= fiveMinAgo : false;
    return {
      id: p.user_id,
      display_name: p.display_name || 'User',
      avatar_url: p.avatar_url ?? null,
      gender: (p as { gender?: string }).gender ?? null,
      age: age != null && age >= 0 && age <= 120 ? age : null,
      marital_status: (p as { marital_status?: string }).marital_status ?? null,
      city: (p as { city?: string | null }).city ?? null,
      is_premium: premiumIds.has(p.user_id),
      shared_count: sharedByUser.get(p.user_id) ?? 0,
      interest_count: interestCountByUser.get(p.user_id) ?? 0,
      last_seen_at: lastSeen ?? null,
      is_active: isActive,
    };
  });

  const male = usersList
    .filter((u) => u.gender === 'male')
    .sort((a, b) => (b.shared_count - a.shared_count) || ((b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0)))
    .slice(0, LIMIT_PER_SECTION);

  const female = usersList
    .filter((u) => u.gender === 'female')
    .sort((a, b) => (b.shared_count - a.shared_count) || ((b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0)))
    .slice(0, LIMIT_PER_SECTION);

  const most_active = [...usersList]
    .sort((a, b) => {
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
      return (b.shared_count - a.shared_count) || (b.interest_count - a.interest_count);
    })
    .slice(0, LIMIT_PER_SECTION);

  const all = usersList
    .sort((a, b) => (b.shared_count - a.shared_count) || ((b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0)))
    .slice(0, LIMIT_PER_SECTION * 2);

  return Response.json({
    male,
    female,
    most_active,
    all,
  });
}

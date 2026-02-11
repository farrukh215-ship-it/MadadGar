import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MIN_SHARED_INTERESTS = 3;

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: myInterests } = await supabase
    .from('user_interests')
    .select('interest_slug')
    .eq('user_id', user.id);
  const mySlugs = new Set((myInterests ?? []).map((r) => r.interest_slug));
  if (mySlugs.size < MIN_SHARED_INTERESTS) {
    return Response.json({ users: [] });
  }

  const { data: allOthers } = await supabase
    .from('user_interests')
    .select('user_id, interest_slug')
    .neq('user_id', user.id);
  const otherByUser = new Map<string, Set<string>>();
  for (const r of allOthers ?? []) {
    if (!otherByUser.has(r.user_id)) otherByUser.set(r.user_id, new Set());
    otherByUser.get(r.user_id)!.add(r.interest_slug);
  }

  const eligibleIds: string[] = [];
  for (const [uid, theirSlugs] of otherByUser) {
    let shared = 0;
    for (const s of theirSlugs) {
      if (mySlugs.has(s)) shared++;
      if (shared >= MIN_SHARED_INTERESTS) break;
    }
    if (shared >= MIN_SHARED_INTERESTS) eligibleIds.push(uid);
  }
  if (eligibleIds.length === 0) return Response.json({ users: [] });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, gender')
    .in('user_id', eligibleIds);

  let premiumRows: { user_id: string }[] = [];
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('user_id')
      .in('user_id', eligibleIds)
      .eq('plan', 'premium')
      .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`);
    premiumRows = (data ?? []) as { user_id: string }[];
  } catch {
    premiumRows = [];
  }
  const premiumIds = new Set(premiumRows.map((r) => r.user_id));

  const sharedCounts = new Map<string, number>();
  for (const uid of eligibleIds) {
    const theirSlugs = otherByUser.get(uid) ?? new Set();
    let n = 0;
    for (const s of theirSlugs) if (mySlugs.has(s)) n++;
    sharedCounts.set(uid, n);
  }

  const usersList = (profiles ?? []).map((p) => ({
    id: p.user_id,
    display_name: p.display_name || 'User',
    avatar_url: p.avatar_url ?? null,
    gender: (p as { gender?: string }).gender ?? null,
    is_premium: premiumIds.has(p.user_id),
    shared_count: sharedCounts.get(p.user_id) ?? 0,
  }));
  usersList.sort((a, b) => (b.shared_count - a.shared_count) || ((b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0)));

  return Response.json({ users: usersList });
}

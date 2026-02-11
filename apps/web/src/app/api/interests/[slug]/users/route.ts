import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  if (!slug) {
    return Response.json({ error: 'slug required' }, { status: 400 });
  }

  const { data: myInterests } = await supabase
    .from('user_interests')
    .select('interest_slug')
    .eq('user_id', user.id);
  const mySlugs = new Set((myInterests ?? []).map((r) => r.interest_slug));

  const { data: interestRows } = await supabase
    .from('user_interests')
    .select('user_id')
    .eq('interest_slug', slug)
    .neq('user_id', user.id);

  const userIds = [...new Set((interestRows ?? []).map((r) => r.user_id))];
  if (userIds.length === 0) {
    return Response.json({ users: [], interest: null });
  }

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

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, gender, date_of_birth')
    .in('user_id', userIds);

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
  const now = new Date();
  const usersList = (profiles ?? []).map((p) => {
    const dob = (p as { date_of_birth?: string }).date_of_birth;
    const age = dob ? Math.floor((now.getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    return {
      id: p.user_id,
      display_name: p.display_name || 'User',
      avatar_url: p.avatar_url ?? null,
      gender: (p as { gender?: string }).gender ?? null,
      age: age != null && age >= 0 && age <= 120 ? age : null,
      is_premium: premiumIds.has(p.user_id),
      shared_count: sharedByUser.get(p.user_id) ?? 0,
    };
  });
  usersList.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));

  const { data: interest } = await supabase
    .from('interest_categories')
    .select('slug, name, icon, parent_group, is_premium, premium_description')
    .eq('slug', slug)
    .single();

  return Response.json({ users: usersList, interest });
}

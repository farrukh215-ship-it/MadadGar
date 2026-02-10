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

  const { data: interestRows } = await supabase
    .from('user_interests')
    .select('user_id')
    .eq('interest_slug', slug)
    .neq('user_id', user.id);

  const userIds = [...new Set((interestRows ?? []).map((r) => r.user_id))];
  if (userIds.length === 0) {
    return Response.json({ users: [], interest: null });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
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
  const usersList = (profiles ?? []).map((p) => ({
    id: p.user_id,
    display_name: p.display_name || 'User',
    avatar_url: p.avatar_url ?? null,
    is_premium: premiumIds.has(p.user_id),
  }));
  usersList.sort((a, b) => (b.is_premium ? 1 : 0) - (a.is_premium ? 1 : 0));

  const { data: interest } = await supabase
    .from('interest_categories')
    .select('slug, name, icon, parent_group, is_premium, premium_description')
    .eq('slug', slug)
    .single();

  return Response.json({ users: usersList, interest });
}

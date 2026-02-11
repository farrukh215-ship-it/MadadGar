import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', user.id);

  const friendIds = [...new Set((data ?? []).map((r) => r.friend_id))];
  if (friendIds.length === 0) {
    return Response.json({ friends: [] });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', friendIds);

  const friends = (profiles ?? []).map((p) => ({
    id: p.user_id,
    display_name: p.display_name || 'User',
    avatar_url: p.avatar_url,
  }));

  return Response.json({ friends });
}

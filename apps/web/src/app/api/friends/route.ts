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
    .select('user_id, display_name, avatar_url, gender, date_of_birth')
    .in('user_id', friendIds);

  const now = new Date();
  const friends = (profiles ?? []).map((p) => {
    const dob = (p as { date_of_birth?: string }).date_of_birth;
    const age = dob ? Math.floor((now.getTime() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    return {
      id: p.user_id,
      display_name: p.display_name || 'User',
      avatar_url: p.avatar_url,
      gender: (p as { gender?: string }).gender ?? null,
      age: age != null && age >= 0 && age <= 120 ? age : null,
    };
  });

  return Response.json({ friends });
}

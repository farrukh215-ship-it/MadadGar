import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Returns users who have posted (for messenger "add to chat") */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('author_id')
    .eq('shadow_hidden', false)
    .neq('author_id', user.id);

  const authorIds = [...new Set((posts ?? []).map((p) => p.author_id).filter(Boolean))];
  if (authorIds.length === 0) {
    return Response.json({ users: [] });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url')
    .in('user_id', authorIds);

  const users = (profiles ?? []).map((p) => ({
    id: p.user_id,
    display_name: p.display_name || 'User',
    avatar_url: p.avatar_url ?? null,
  }));

  return Response.json({ users });
}

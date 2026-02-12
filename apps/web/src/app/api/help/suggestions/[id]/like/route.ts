import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: suggestionId } = await params;

  const { data: existing } = await supabase
    .from('help_suggestion_likes')
    .select('suggestion_id')
    .eq('suggestion_id', suggestionId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabase
      .from('help_suggestion_likes')
      .delete()
      .eq('suggestion_id', suggestionId)
      .eq('user_id', user.id);
    const { count } = await supabase
      .from('help_suggestion_likes')
      .select('*', { count: 'exact', head: true })
      .eq('suggestion_id', suggestionId);
    return Response.json({ liked: false, like_count: count ?? 0 });
  }

  await supabase.from('help_suggestion_likes').insert({
    suggestion_id: suggestionId,
    user_id: user.id,
  });

  const { count } = await supabase
    .from('help_suggestion_likes')
    .select('*', { count: 'exact', head: true })
    .eq('suggestion_id', suggestionId);

  return Response.json({ liked: true, like_count: count ?? 0 });
}

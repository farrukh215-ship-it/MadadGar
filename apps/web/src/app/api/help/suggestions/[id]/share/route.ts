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

  const { data: suggestion } = await supabase
    .from('help_suggestions')
    .select('id, content')
    .eq('id', suggestionId)
    .single();

  if (!suggestion) {
    return Response.json({ error: 'Suggestion not found' }, { status: 404 });
  }

  await supabase.from('help_suggestion_shares').insert({
    suggestion_id: suggestionId,
    user_id: user.id,
  });

  const { count } = await supabase
    .from('help_suggestion_shares')
    .select('*', { count: 'exact', head: true })
    .eq('suggestion_id', suggestionId);

  return Response.json({ share_count: count ?? 0 });
}

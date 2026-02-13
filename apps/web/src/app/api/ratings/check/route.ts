import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get('post_id');
  if (!postId) {
    return Response.json({ error: 'post_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ has_rated: false });
  }

  const { data } = await supabase
    .from('ratings')
    .select('id')
    .eq('post_id', postId)
    .eq('rater_id', user.id)
    .limit(1)
    .maybeSingle();

  return Response.json({ has_rated: !!data });
}

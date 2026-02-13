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

  const { id: requestId } = await params;
  const body = await request.json();
  const { content } = body as { content?: string };

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return Response.json({ error: 'Content required' }, { status: 400 });
  }
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  if (words < 3) return Response.json({ error: 'Suggestion mein kam az kam 3 words hon' }, { status: 400 });
  if (words > 100) return Response.json({ error: 'Suggestion max 100 words' }, { status: 400 });

  const { data: req, error: reqErr } = await supabase
    .from('help_requests')
    .select('id')
    .eq('id', requestId)
    .single();

  if (reqErr || !req) {
    return Response.json({ error: 'Request not found' }, { status: 404 });
  }

  const { data: inserted, error } = await supabase
    .from('help_suggestions')
    .insert({
      request_id: requestId,
      author_id: user.id,
      content: content.trim().slice(0, 2000),
    })
    .select('id, content, author_id, created_at')
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('user_id', user.id)
    .single();

  return Response.json({
    suggestion: {
      id: inserted.id,
      content: inserted.content,
      author_id: inserted.author_id,
      author_name: profile?.display_name ?? 'User',
      avatar_url: profile?.avatar_url ?? null,
      created_at: inserted.created_at,
      like_count: 0,
      share_count: 0,
      user_liked: false,
    },
  });
}

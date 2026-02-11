import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const threadId = searchParams.get('thread_id');
  const q = searchParams.get('q')?.trim();

  if (!threadId || !q || q.length < 2) {
    return Response.json({ messages: [] });
  }

  const { data: participants } = await supabase
    .from('chat_participants')
    .select('user_id')
    .eq('thread_id', threadId);

  const isParticipant = (participants ?? []).some((p) => p.user_id === user.id);
  if (!isParticipant) {
    return Response.json({ error: 'Not a participant' }, { status: 403 });
  }

  const escaped = String(q).replace(/[%_\\]/g, (c) => '\\' + c);
  const pattern = `%${escaped}%`;
  const { data } = await supabase
    .from('messages')
    .select('id, content, message_type, sender_id, created_at')
    .eq('thread_id', threadId)
    .eq('message_type', 'text')
    .is('deleted_at', null)
    .not('content', 'is', null)
    .ilike('content', pattern)
    .order('created_at', { ascending: true })
    .limit(50);

  return Response.json({ messages: data ?? [] });
}

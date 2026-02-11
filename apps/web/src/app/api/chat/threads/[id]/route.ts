import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: threadId } = await params;

  const { data: participants } = await supabase
    .from('chat_participants')
    .select('user_id')
    .eq('thread_id', threadId);

  const isParticipant = (participants ?? []).some((p) => p.user_id === user.id);
  if (!isParticipant) {
    return Response.json({ error: 'Not a participant' }, { status: 403 });
  }

  const otherId = (participants ?? []).find((p) => p.user_id !== user.id)?.user_id;
  if (!otherId) {
    return Response.json({ other_user: null, title: 'Chat' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, display_name, avatar_url, gender, date_of_birth, marital_status, bio')
    .eq('user_id', otherId)
    .single();

  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId)
    .neq('sender_id', user.id)
    .is('read_at', null);

  const age = profile?.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
  return Response.json({
    other_user: profile ? {
      id: profile.user_id,
      display_name: profile.display_name || 'User',
      avatar_url: profile.avatar_url,
      gender: (profile as { gender?: string }).gender ?? null,
      age: age != null && age >= 0 && age <= 120 ? age : null,
      marital_status: (profile as { marital_status?: string }).marital_status ?? null,
      bio: (profile as { bio?: string }).bio ?? null,
    } : null,
    title: profile?.display_name || 'Chat',
    unread_count: count ?? 0,
  });
}

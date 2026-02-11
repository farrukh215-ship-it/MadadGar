import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: messageId } = await params;

  const { data: msg } = await supabase
    .from('messages')
    .select('id, sender_id, thread_id')
    .eq('id', messageId)
    .single();

  if (!msg) {
    return Response.json({ error: 'Message not found' }, { status: 404 });
  }

  if (msg.sender_id !== user.id) {
    return Response.json({ error: 'Can only delete your own messages' }, { status: 403 });
  }

  const forEveryone = _request.headers.get('x-delete-for-everyone') === 'true';

  let isPremium = false;
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('plan', 'premium')
    .or('ends_at.is.null,ends_at.gt.' + new Date().toISOString())
    .maybeSingle();
  isPremium = !!sub;

  if (forEveryone && !isPremium) {
    return Response.json({ error: 'Delete for everyone is a Premium feature' }, { status: 403 });
  }

  const update: { deleted_at: string; deleted_by?: string } = {
    deleted_at: new Date().toISOString(),
  };
  if (forEveryone) {
    update.deleted_by = user.id;
  }

  const { error } = await supabase
    .from('messages')
    .update(update)
    .eq('id', messageId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}

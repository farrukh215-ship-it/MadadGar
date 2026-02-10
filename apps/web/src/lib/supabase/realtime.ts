import { createClient } from './client';

export type RealtimeChannel = ReturnType<
  ReturnType<typeof createClient>['channel']
>;

export function subscribeToMessages(
  threadId: string,
  onMessage: (payload: unknown) => void,
  onMessageUpdate?: (payload: unknown) => void
) {
  const supabase = createClient();
  let ch = supabase
    .channel(`thread:${threadId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => onMessage(payload)
    );
  if (onMessageUpdate) {
    ch = ch.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => onMessageUpdate(payload)
    );
  }
  const channel = ch.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToThreadList(
  userId: string,
  onThread: (payload: unknown) => void
) {
  const supabase = createClient();
  // Subscribe to new messages where user is participant
  const channel = supabase
    .channel(`user_threads:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => onThread(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type ToastMsg = { id: string; title: string; body?: string; link: string };

export function ChatToast() {
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const chRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      chRef.current = supabase
        .channel('chat-toast')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          async (payload) => {
            const m = (payload as { new: { sender_id: string; thread_id: string; content: string | null } }).new;
            if (m.sender_id === user.id) return;
            const { data: pts } = await supabase.from('chat_participants').select('user_id').eq('thread_id', m.thread_id);
            const amInThread = (pts ?? []).some((p) => p.user_id === user.id);
            if (!amInThread) return;
            if (typeof window !== 'undefined' && window.location.pathname === `/chat/${m.thread_id}`) return;
            const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', m.sender_id).single();
            const preview = (m.content || 'Sent a message').slice(0, 40) + ((m.content?.length ?? 0) > 40 ? '...' : '');
            setToast({
              id: `${m.thread_id}-${Date.now()}`,
              title: profile?.display_name || 'New message',
              body: preview,
              link: `/chat/${m.thread_id}`,
            });
            setTimeout(() => setToast(null), 4000);
          }
        )
        .subscribe();
    });
    return () => { if (chRef.current) supabase.removeChannel(chRef.current); };
  }, []);

  if (!toast) return null;

  return (
    <Link
      href={toast.link}
      className="fixed bottom-24 left-4 right-4 z-[100] mx-auto max-w-sm animate-slide-up rounded-2xl bg-white shadow-xl border border-stone-200 p-3 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg shrink-0">💬</div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-stone-900 truncate">{toast.title}</p>
        <p className="text-sm text-stone-500 truncate">{toast.body}</p>
      </div>
    </Link>
  );
}

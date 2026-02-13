'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Thread = {
  id: string;
  updated_at: string;
  post_id: string | null;
  title: string;
};

type ChatUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  interests?: { name: string; icon: string }[];
};

export function MessengerPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [startingWith, setStartingWith] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch('/api/chat/threads').then((r) => r.json()),
      fetch('/api/chat/contacts').then((r) => r.json()),
    ])
      .then(([threadData, userData]) => {
        setThreads(threadData.threads ?? []);
        setUsers(userData.users ?? []);
        const ids = (userData.users ?? []).map((u: ChatUser) => u.id).filter(Boolean);
        if (ids.length > 0) {
          return fetch(`/api/presence?ids=${ids.join(',')}`)
            .then((r) => r.json())
            .then((d) => setOnline(d.online ?? {}));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/presence', { method: 'POST' }).catch(() => {});
  }, [open]);

  const startChat = async (userId: string) => {
    setStartingWith(userId);
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent('/feed')}`);
        return;
      }
      if (data.thread?.id) {
        onClose();
        router.push(`/chat/${data.thread.id}`);
      }
    } finally {
      setStartingWith(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/30" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed left-0 top-0 bottom-0 z-[95] w-full max-w-sm bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-label="Messenger"
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-brand-600 text-white">
          <div>
            <h2 className="font-semibold text-lg">Messenger</h2>
            <p className="text-sm text-brand-100">Chat</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-stone-100">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Chats</p>
                {threads.length === 0 ? (
                  <p className="text-sm text-stone-500">No chats yet</p>
                ) : (
                  <div className="space-y-1">
                    {threads.map((t) => (
                      <Link
                        key={t.id}
                        href={`/chat/${t.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition"
                      >
                        <div className="relative w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-lg shrink-0">
                          💬
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 truncate text-sm">{t.title}</p>
                          <p className="text-xs text-stone-500">
                            {t.updated_at
                              ? new Date(t.updated_at).toLocaleDateString('en-PK', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Contacts</p>
                {users.length === 0 ? (
                  <p className="text-sm text-stone-500">Add contacts from Squad, profiles, or feed. Then start chatting.</p>
                ) : (
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => startChat(u.id)}
                        disabled={startingWith === u.id}
                        className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-stone-50 transition text-left disabled:opacity-50"
                      >
                        <div className="relative w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <Image src={u.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <span className="text-lg">👤</span>
                          )}
                          {online[u.id] && (
                            <span
                              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"
                              title="Online"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-stone-900 text-sm truncate block">{u.display_name}</span>
                          {u.interests && u.interests.length > 0 && (
                            <p className="text-xs text-stone-500 mt-0.5 truncate" title={u.interests.map((i) => `${i.icon} ${i.name}`).join(', ')}>
                              {u.interests.slice(0, 3).map((i) => `${i.icon} ${i.name}`).join(' · ')}
                              {u.interests.length > 3 && ` +${u.interests.length - 3}`}
                            </p>
                          )}
                        </div>
                        {startingWith === u.id && (
                          <span className="text-xs text-stone-500 shrink-0">...</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="p-4 border-t border-stone-200">
          <Link
            href="/chat"
            onClick={onClose}
            className="block w-full py-3 rounded-xl bg-brand-600 text-white text-center font-medium hover:bg-brand-700 transition"
          >
            View all chats
          </Link>
        </div>
      </div>
    </>
  );
}

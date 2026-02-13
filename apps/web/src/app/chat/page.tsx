'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChatListSkeleton } from '@/components/Skeleton';

type Thread = {
  id: string;
  updated_at: string;
  post_id: string | null;
  title: string;
  unread_count?: number;
  last_message?: string | null;
  is_friend?: boolean;
  friend_request_sent?: boolean;
  other_user?: { id: string; display_name: string; gender: string | null; age: number | null; marital_status?: string | null } | null;
};

function formatMaritalStatus(s: string | null | undefined): string {
  if (!s) return '';
  const m: Record<string, string> = { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed', prefer_not_to_say: 'Prefer not to say' };
  return m[s] ?? s;
}

function formatLastSeen(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 86400 * 2) return 'yesterday';
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString();
}

export default function ChatListPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSeenMap, setLastSeenMap] = useState<Record<string, string>>({});
  const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/chat');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/chat/threads');
        const data = await res.json();
        const list = data.threads ?? [];
        setThreads(list);
        const otherIds = list.map((t: Thread) => t.other_user?.id).filter(Boolean) as string[];
        if (otherIds.length > 0) {
          const presRes = await fetch(`/api/presence?ids=${otherIds.join(',')}`);
          const presData = await presRes.json();
          setOnlineMap(presData.online ?? {});
          setLastSeenMap(presData.last_seen ?? {});
        }
      } catch {
        setThreads([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-base">
      <header className="sticky top-0 z-40 bg-brand-800 text-white shadow-lg pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/feed" className="flex items-center gap-2 shrink-0 min-w-0">
              <Image src="/logo.png" alt="Madadgar" width={26} height={26} className="rounded shrink-0" />
              <span className="font-bold text-sm sm:text-base truncate hidden sm:inline">Madadgar</span>
            </Link>
            <h1 className="text-base sm:text-lg font-semibold truncate flex-1 text-center min-w-0">Chats</h1>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/chat/friends" className="px-2 py-1.5 rounded-lg text-xs sm:text-sm text-brand-200 hover:text-white hover:bg-white/10 font-medium">
                Friends
              </Link>
              <Link href="/chat/interests" className="px-2 py-1.5 rounded-lg text-xs sm:text-sm text-brand-200 hover:text-white hover:bg-white/10 font-medium">
                Interests
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <ChatListSkeleton count={5} />
        ) : threads.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-stone-200/80 shadow-premium animate-fade-in">
            <div className="text-5xl mb-4" aria-hidden>💬</div>
            <p className="font-semibold text-stone-800">No chats yet</p>
            <p className="mt-1 text-sm text-stone-500">Start by tapping Chat on any helper in the feed</p>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Link
                href="/chat/interests"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-premium-brand transition-all hover:shadow-premium-brand-hover btn-tap"
              >
                Yaari
              </Link>
              <Link
                href="/chat/friends"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition btn-tap"
              >
                Friends
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-stone-200 text-stone-700 font-semibold hover:bg-stone-300 transition btn-tap"
              >
                Browse helpers
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {threads.map((t) => {
              const ou = t.other_user;
              const online = ou ? onlineMap[ou.id] : false;
              const lastSeen = ou ? lastSeenMap[ou.id] : null;
              const meta: string[] = [];
              if (ou) {
                if (ou.gender) meta.push(ou.gender === 'female' ? 'Female' : ou.gender === 'male' ? 'Male' : 'Other');
                if (ou.age != null) meta.push(`${ou.age} yrs`);
                const ms = formatMaritalStatus(ou.marital_status);
                if (ms) meta.push(ms);
                if (online) meta.push('Online');
                else if (lastSeen) meta.push(`Last seen ${formatLastSeen(lastSeen)}`);
              }
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white border border-stone-100 hover:border-brand-200 hover:shadow-sm transition"
                >
                  <div className="relative w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-xl shrink-0">
                    💬
                    {(t.unread_count ?? 0) > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {t.unread_count! > 99 ? '99+' : t.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-900 truncate flex items-center gap-1 flex-wrap">
                      {ou ? (
                        <Link href={`/profile/${ou.id}`} className="hover:text-brand-700 hover:underline">
                          {t.title}
                        </Link>
                      ) : (
                        <span>{t.title}</span>
                      )}
                      {t.is_friend && <span className="text-xs text-green-600 font-normal">• Friends</span>}
                      {t.friend_request_sent && !t.is_friend && <span className="text-xs text-stone-500 font-normal">• Request sent</span>}
                    </p>
                    {meta.length > 0 && (
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {meta.join(' • ')}
                      </p>
                    )}
                    <p className="text-sm text-stone-600 truncate mt-0.5">
                      {t.last_message || 'No messages yet'}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
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
                  <Link
                    href={`/chat/${t.id}`}
                    className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-green-600 text-white hover:bg-green-700 transition shrink-0 btn-tap"
                    title="Open chat"
                    aria-label="Open chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-stone-200 flex justify-around py-3 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50">
        <Link href="/feed" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Home
        </Link>
        <Link href="/post" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-brand-600 font-semibold">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
      </nav>
      <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" />
    </div>
  );
}

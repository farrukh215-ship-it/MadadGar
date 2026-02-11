'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Friend = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

type FriendRequest = {
  id: string;
  from_user_id: string;
  from_name: string;
  from_avatar: string | null;
  created_at: string;
};

function AvatarIcon({ avatarUrl }: { avatarUrl?: string | null }) {
  if (avatarUrl) return null;
  return <span className="flex items-center justify-center w-full h-full text-lg">👤</span>;
}

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        fetch('/api/friends'),
        fetch('/api/friends/requests'),
      ]);
      const friendsData = await friendsRes.json();
      const requestsData = await requestsRes.json();
      setFriends(friendsData.friends ?? []);
      setRequests(requestsData.requests ?? []);
      const ids = [...(friendsData.friends ?? []).map((f: Friend) => f.id)];
      if (ids.length > 0) {
        const presRes = await fetch(`/api/presence?ids=${ids.join(',')}`);
        const presData = await presRes.json();
        setOnline(presData.online ?? {});
      }
    } catch {
      setFriends([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/friends');
      const data = await res.json();
      if (res.status === 401) {
        router.push('/login?next=/chat/friends');
        return;
      }
      await loadData();
    })();
  }, [router, loadData]);

  const startChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.ok && data.thread?.id) {
        router.push(`/chat/${data.thread.id}`);
      } else {
        alert(data?.error ?? 'Failed to start chat');
      }
    } catch {
      alert('Failed to start chat');
    } finally {
      setStartingChat(null);
    }
  };

  const acceptRequest = async (requestId: string) => {
    setAccepting(requestId);
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      });
      if (res.ok) await loadData();
      else alert((await res.json()).error ?? 'Failed to accept');
    } catch {
      alert('Failed to accept');
    } finally {
      setAccepting(null);
    }
  };

  const declineRequest = async (requestId: string) => {
    try {
      await fetch('/api/friends/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId }),
      });
      await loadData();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <header className="sticky top-0 z-40 bg-brand-800 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/chat" className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-bold">Madadgar</span>
            </Link>
            <h1 className="text-lg font-semibold">Friends</h1>
            <Link href="/chat/interests" className="text-sm text-brand-200 hover:text-white">
              Interests
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {requests.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-stone-700 mb-3">Friend requests</h2>
                <div className="space-y-2">
                  {requests.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-stone-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                          {r.from_avatar ? (
                            <Image src={r.from_avatar} alt="" width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <AvatarIcon avatarUrl={null} />
                          )}
                        </div>
                        <span className="font-medium text-stone-900">{r.from_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => declineRequest(r.id)}
                          className="px-4 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-medium hover:bg-stone-200"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => acceptRequest(r.id)}
                          disabled={accepting === r.id}
                          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                        >
                          {accepting === r.id ? '...' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-bold text-stone-700 mb-3">
                Friends {friends.length > 0 && `(${friends.length})`}
              </h2>
              {friends.length === 0 && requests.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border border-stone-200">
                  <p className="text-stone-600">No friends yet</p>
                  <p className="text-sm text-stone-500 mt-1">Add people as friends from your chats</p>
                  <Link href="/chat/interests" className="mt-4 inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">
                    Find people
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white border border-stone-100 hover:border-brand-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                          {f.avatar_url ? (
                            <Image src={f.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <AvatarIcon avatarUrl={null} />
                          )}
                          {online[f.id] && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" title="Online" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-stone-900">{f.display_name}</span>
                          <p className="text-xs text-stone-500">{online[f.id] ? 'Online' : 'Offline'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => startChat(f.id)}
                        disabled={startingChat === f.id}
                        className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                      >
                        {startingChat === f.id ? '...' : 'Chat'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

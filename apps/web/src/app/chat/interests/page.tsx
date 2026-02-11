'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Interest = {
  slug: string;
  name: string;
  icon: string;
  parent_group: string;
  sort_order: number;
  is_premium: boolean;
  premium_description: string | null;
};

type GroupedInterest = {
  group: string;
  interests: Interest[];
};

type ChatUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  gender?: string | null;
  is_premium?: boolean;
  shared_count?: number;
  distance_km?: number;
};

function AvatarIcon({ gender, avatarUrl }: { gender?: string | null; avatarUrl?: string | null }) {
  if (avatarUrl) return null;
  if (gender === 'female') return <span className="flex items-center justify-center w-full h-full text-lg">👩</span>;
  if (gender === 'male') return <span className="flex items-center justify-center w-full h-full text-lg">👨</span>;
  return <span className="flex items-center justify-center w-full h-full text-lg">👤</span>;
}

const GROUP_LABELS: Record<string, string> = {
  hobbies: 'Hobbies',
  sports: 'Sports',
  entertainment: 'Entertainment & TV',
  'food-dining': 'Food & Dining',
  travel: 'Travel',
  technology: 'Technology',
  lifestyle: 'Lifestyle',
};

const GROUP_ICONS: Record<string, string> = {
  hobbies: '📚',
  sports: '⚽',
  entertainment: '📺',
  'food-dining': '🍽️',
  travel: '🧳',
  technology: '💻',
  lifestyle: '✨',
};

export default function InterestedPeoplePage() {
  const router = useRouter();
  const [grouped, setGrouped] = useState<GroupedInterest[]>([]);
  const [myInterests, setMyInterests] = useState<Set<string>>(new Set());
  const [isPremium, setIsPremium] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [usersByInterest, setUsersByInterest] = useState<Record<string, ChatUser[]>>({});
  const [loadingUsers, setLoadingUsers] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [online, setOnline] = useState<Record<string, boolean>>({});
  const [chatEligible, setChatEligible] = useState<ChatUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [nearbyExpanded, setNearbyExpanded] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<ChatUser[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [friendStatusByUser, setFriendStatusByUser] = useState<Record<string, 'none' | 'pending_sent' | 'friends'>>({});
  const [addingFriendFor, setAddingFriendFor] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [interestsRes, myRes] = await Promise.all([
        fetch('/api/interests'),
        fetch('/api/interests/my'),
      ]);
      if (interestsRes.ok) {
        const data = await interestsRes.json();
        setGrouped(data.interests ?? []);
      }
      if (myRes.ok) {
        const data = await myRes.json();
        setMyInterests(new Set(data.interests ?? []));
        setIsPremium(!!data.is_premium);
      }
    } catch {
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fetch('/api/presence', { method: 'POST' }).catch(() => {});
  }, []);

  const loadChatEligible = useCallback(async () => {
    try {
      const res = await fetch('/api/interests/chat-eligible');
      const data = await res.json();
      const users = data.users ?? [];
      setChatEligible(users);
      const ids = users.map((u: ChatUser) => u.id).filter(Boolean);
      if (ids.length > 0) {
        const presRes = await fetch(`/api/presence?ids=${ids.join(',')}`);
        const presData = await presRes.json();
        setOnline((prev) => ({ ...prev, ...(presData.online ?? {}) }));
      }
    } catch {
      setChatEligible([]);
    }
  }, []);

  useEffect(() => {
    if (!loading && grouped.length > 0) loadChatEligible();
  }, [loading, grouped.length, loadChatEligible]);

  const toggleInterest = async (slug: string) => {
    setLimitError(null);
    const has = myInterests.has(slug);
    try {
      if (has) {
        await fetch(`/api/interests/my?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
        setMyInterests((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      } else {
        const res = await fetch('/api/interests/my', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interest_slug: slug }),
        });
        const data = await res.json();
        if (res.status === 403 && data.error === 'limit_reached') {
          setLimitError(data.message ?? 'Interest limit reached. Upgrade to Premium for unlimited.');
          return;
        }
        if (res.ok) {
          setMyInterests((prev) => new Set([...prev, slug]));
        }
      }
    } catch {
      // ignore
    }
  };

  const loadUsers = async (slug: string) => {
    if (usersByInterest[slug]) {
      setExpandedSlug((s) => (s === slug ? null : slug));
      return;
    }
    setLoadingUsers(slug);
    try {
      const res = await fetch(`/api/interests/${slug}/users`);
      const data = await res.json();
      const users = data.users ?? [];
      setUsersByInterest((prev) => ({ ...prev, [slug]: users }));
      setExpandedSlug((s) => (s === slug ? null : slug));
      const ids = users.map((u: ChatUser) => u.id).filter(Boolean);
      if (ids.length > 0) {
        const presRes = await fetch(`/api/presence?ids=${ids.join(',')}`);
        const presData = await presRes.json();
        setOnline((prev) => ({ ...prev, ...(presData.online ?? {}) }));
      }
    } catch {
      setUsersByInterest((prev) => ({ ...prev, [slug]: [] }));
    } finally {
      setLoadingUsers(null);
    }
  };

  const loadNearby = useCallback(async () => {
    if (!navigator.geolocation) {
      setNearbyError('Location not supported');
      return;
    }
    setNearbyLoading(true);
    setNearbyError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          await fetch('/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng }),
          });
          const res = await fetch(`/api/interests/nearby-all?lat=${lat}&lng=${lng}&radius=10`);
          const data = await res.json();
          if (res.ok) {
            setNearbyUsers(data.users ?? []);
            const ids = (data.users ?? []).map((u: ChatUser) => u.id);
            if (ids.length > 0) {
              const presRes = await fetch(`/api/presence?ids=${ids.join(',')}`);
              const presData = await presRes.json();
              setOnline((prev) => ({ ...prev, ...(presData.online ?? {}) }));
            }
          } else {
            setNearbyError(data.error ?? 'Failed to load nearby');
          }
        } catch {
          setNearbyError('Failed to load nearby users');
        } finally {
          setNearbyLoading(false);
        }
      },
      () => {
        setNearbyError('Location access denied');
        setNearbyLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const addFriend = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addingFriendFor) return;
    setAddingFriendFor(userId);
    try {
      const res = await fetch('/api/friends/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFriendStatusByUser((prev) => ({ ...prev, [userId]: 'pending_sent' }));
      } else {
        if (data.error === 'Already friends') setFriendStatusByUser((prev) => ({ ...prev, [userId]: 'friends' }));
        else if (data.error === 'Request already pending') setFriendStatusByUser((prev) => ({ ...prev, [userId]: 'pending_sent' }));
        else alert(data.error ?? 'Failed');
      }
    } catch {
      alert('Failed to send friend request');
    } finally {
      setAddingFriendFor(null);
    }
  };

  const toggleNearby = () => {
    const next = !nearbyExpanded;
    setNearbyExpanded(next);
    if (next && nearbyUsers.length === 0 && !nearbyLoading) loadNearby();
  };

  const startChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent('/chat/interests')}`);
        return;
      }
      if (!res.ok) {
        alert(data?.error ?? 'Failed to start chat. Please try again.');
        return;
      }
      if (data.thread?.id) {
        router.push(`/chat/${data.thread.id}`);
      } else {
        alert('Could not open chat. Please try again.');
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
    } finally {
      setStartingChat(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="sticky top-0 z-40 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)] backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded" />
              <span className="font-bold">Madadgar</span>
            </Link>
            <h1 className="text-lg font-semibold">Interested People</h1>
            <div className="flex items-center gap-2">
              <Link href="/chat/friends" className="text-sm text-brand-100 hover:text-white font-medium">
                Friends
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 transition text-sm font-medium"
              >
              <span className="relative">
                💬
                {chatEligible.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {chatEligible.length}
                  </span>
                )}
              </span>
              Available for Chat
              </button>
            </div>
          </div>
          <p className="text-sm text-brand-100 mt-1">
            Chat with people who share your interests
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-stone-500">Loading interests...</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 shadow-premium overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center text-4xl mb-4 shadow-sm">
              💬
            </div>
            <p className="text-stone-600 font-semibold">No interests available</p>
            <p className="text-sm text-stone-500 mt-1 max-w-xs mx-auto">Add interests to discover people who share your passions</p>
            <Link
              href="/profile/edit"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-premium-brand transition-all duration-200"
            >
              Add interests in Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <section className="animate-fade-in">
              <div
                className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl border border-emerald-400/30 shadow-premium overflow-hidden cursor-pointer hover:shadow-premium-hover transition-all duration-300"
                onClick={toggleNearby}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-2">
                        Nearby
                        <span className="text-emerald-100 text-xs font-normal">within 10km, same interests</span>
                      </p>
                      <p className="text-sm text-emerald-100 mt-0.5">Chat with people near you who share your interests</p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-white/80 transition-transform duration-300 ${nearbyExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {nearbyExpanded && (
                  <div className="border-t border-emerald-400/30 p-4 bg-white/5 animate-fade-in">
                    {nearbyLoading ? (
                      <div className="py-8 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        <p className="text-sm text-emerald-100 mt-2">Getting your location...</p>
                      </div>
                    ) : nearbyError ? (
                      <p className="text-center text-amber-200 py-4">{nearbyError}</p>
                    ) : nearbyUsers.length === 0 ? (
                      <p className="text-center text-emerald-100 py-4">
                        No one nearby with shared interests. Add more interests or try again later.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide mb-2">
                          {nearbyUsers.length} people nearby
                        </p>
                        {nearbyUsers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-full bg-white/20 overflow-hidden shrink-0">
                                {u.avatar_url ? (
                                  <Image src={u.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                                ) : (
                                  <AvatarIcon gender={u.gender} avatarUrl={u.avatar_url} />
                                )}
                                {online[u.id] && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" title="Online" />
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-white">{u.display_name}</span>
                                <span className="text-xs text-emerald-100 block">
                                  {u.distance_km != null ? `${u.distance_km} km away` : `${u.shared_count ?? 0} shared`}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => addFriend(u.id, e)}
                                disabled={addingFriendFor === u.id || friendStatusByUser[u.id] === 'pending_sent' || friendStatusByUser[u.id] === 'friends'}
                                className={`px-3 py-2 rounded-xl text-sm font-medium shrink-0 ${
                                  friendStatusByUser[u.id] === 'friends'
                                    ? 'bg-green-500/20 text-green-300'
                                    : friendStatusByUser[u.id] === 'pending_sent'
                                    ? 'bg-white/20 text-emerald-100'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                } disabled:opacity-50`}
                              >
                                {addingFriendFor === u.id ? '...' : friendStatusByUser[u.id] === 'friends' ? '✓ Friends' : friendStatusByUser[u.id] === 'pending_sent' ? 'Request sent' : 'Add friend'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); startChat(u.id); }}
                                disabled={startingChat === u.id}
                                className="px-4 py-2 rounded-xl bg-white text-emerald-700 text-sm font-medium hover:bg-emerald-50 disabled:opacity-50"
                              >
                                {startingChat === u.id ? '...' : 'Chat'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
            {grouped.map(({ group, interests }) => (
              <section key={group} className="animate-fade-in">
                <h2 className="flex items-center gap-2 text-sm font-bold text-stone-700 mb-3">
                  <span>{GROUP_ICONS[group] ?? '🌟'}</span>
                  {GROUP_LABELS[group] ?? group}
                </h2>
                <div className="space-y-2">
                  {interests.map((int) => {
                    const has = myInterests.has(int.slug);
                    const expanded = expandedSlug === int.slug;
                    const users = usersByInterest[int.slug] ?? [];
                    const isLoadingUsers = loadingUsers === int.slug;

                    return (
                      <div
                        key={int.slug}
                        className="bg-white rounded-2xl border border-stone-100 shadow-premium overflow-hidden transition-all duration-300 hover:shadow-premium-hover hover:-translate-y-0.5"
                      >
                        <div
                          className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50/80 transition-colors duration-200"
                          onClick={() => loadUsers(int.slug)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{int.icon}</span>
                            <div>
                              <p className="font-semibold text-stone-900 flex items-center gap-2">
                                {int.name}
                                {int.is_premium && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200/80 shadow-sm">
                                    Premium
                                  </span>
                                )}
                              </p>
                              {int.premium_description && (
                                <p className="text-xs text-stone-500 mt-0.5">{int.premium_description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleInterest(int.slug);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                                has
                                  ? 'bg-brand-600 text-white shadow-sm'
                                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              }`}
                            >
                              {has ? '✓ Added' : 'Add'}
                            </button>
                            <svg
                              className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {expanded && (
                          <div className="border-t border-stone-100 p-4 bg-stone-50/50 animate-fade-in">
                            {isLoadingUsers ? (
                              <div className="py-8 text-center">
                                <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            ) : users.length === 0 ? (
                              <p className="text-sm text-stone-500 text-center py-4">
                                No one has added this interest yet. Add it to your profile and invite others!
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                                  People interested in {int.name}
                                  {(() => {
                                    const onlineCount = users.filter((u) => online[u.id]).length;
                                    return onlineCount > 0 ? (
                                      <span className="ml-1.5 text-green-600 font-normal">• {onlineCount} online</span>
                                    ) : null;
                                  })()}
                                </p>
                                {users.map((u) => (
                                  <div
                                    key={u.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-stone-100 hover:border-brand-200 shadow-sm transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="relative w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0 ring-2 ring-white shadow-sm">
                                        {u.avatar_url ? (
                                          <Image src={u.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                                        ) : (
                                          <AvatarIcon gender={u.gender} avatarUrl={u.avatar_url} />
                                        )}
                                        {online[u.id] && (
                                          <span
                                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"
                                            title="Online"
                                          />
                                        )}
                                        {u.is_premium && (
                                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white">★</span>
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-medium text-stone-900 flex items-center gap-1.5">
                                          {u.display_name}
                                          {u.is_premium && (
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Premium</span>
                                          )}
                                        </span>
                                        {(u.shared_count ?? 0) > 0 && (
                                          <span className="text-[10px] text-stone-500 block">{u.shared_count} shared</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={(e) => addFriend(u.id, e)}
                                        disabled={addingFriendFor === u.id || friendStatusByUser[u.id] === 'pending_sent' || friendStatusByUser[u.id] === 'friends'}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium ${
                                          friendStatusByUser[u.id] === 'friends'
                                            ? 'bg-green-100 text-green-700'
                                            : friendStatusByUser[u.id] === 'pending_sent'
                                            ? 'bg-stone-100 text-stone-500'
                                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                                        } disabled:opacity-50`}
                                      >
                                        {addingFriendFor === u.id ? '...' : friendStatusByUser[u.id] === 'friends' ? '✓ Friends' : friendStatusByUser[u.id] === 'pending_sent' ? 'Request sent' : 'Add friend'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => startChat(u.id)}
                                        disabled={startingChat === u.id}
                                        className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 shadow-premium-brand transition-all duration-200"
                                      >
                                        {startingChat === u.id ? '...' : 'Chat'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {limitError && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800">{limitError}</p>
            <a
              href="/profile"
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
            >
              Upgrade
            </a>
          </div>
        )}

        {!isPremium && myInterests.size >= 4 && (
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200/80 shadow-premium">
            <div className="flex items-center gap-3">
              <span className="text-2xl">★</span>
              <div>
                <p className="font-semibold text-amber-900">Upgrade to Premium</p>
                <p className="text-sm text-amber-800 mt-0.5">Unlimited interests, top visibility, premium badges</p>
                <Link
                  href="/profile"
                  className="mt-2 inline-block px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-5 rounded-2xl bg-brand-50/80 border border-brand-200/80 shadow-premium">
          <p className="text-sm font-semibold text-brand-900">How it works</p>
          <ul className="mt-3 text-sm text-brand-800 space-y-2.5">
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm shadow-sm">1</span>
              Add interests from categories above
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm shadow-sm">2</span>
              Find people who share the same interests
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm shadow-sm">3</span>
              Start a chat directly from here
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shadow-sm">★</span>
              Premium interests offer extra visibility and features
            </li>
            <li className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-[10px]">●</span>
              Green dot = user is online (active in last 5 min)
            </li>
          </ul>
        </div>
      </main>

      {/* Right sidebar: Available for Chat (3+ shared interests) */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/30" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <div
            className="fixed right-0 top-0 bottom-0 z-[85] w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-right"
            role="dialog"
            aria-label="Available for Chat"
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-brand-600 text-white">
              <div>
                <h2 className="font-semibold text-lg">Available for Chat</h2>
                <p className="text-sm text-brand-100">Same interests • Chat anytime</p>
              </div>
              <button type="button" onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {chatEligible.length === 0 ? (
                <p className="text-sm text-stone-500 py-8 text-center">
                  Add interests above, expand to see people, then chat here.
                </p>
              ) : (
                <div className="space-y-2">
                  {chatEligible.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 hover:border-brand-200 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                          {u.avatar_url ? (
                            <Image src={u.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                          ) : (
                            <AvatarIcon gender={u.gender} avatarUrl={u.avatar_url} />
                          )}
                          {online[u.id] && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" title="Online" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-stone-900 block">{u.display_name}</span>
                          <span className="text-xs text-stone-500">{u.shared_count ?? 0} shared interests</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => startChat(u.id)}
                        disabled={startingChat === u.id}
                        className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                      >
                        {startingChat === u.id ? '...' : 'Chat'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-stone-200 flex justify-around py-3 px-2 z-50">
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
      <div className="h-20 lg:hidden" />
    </div>
  );
}

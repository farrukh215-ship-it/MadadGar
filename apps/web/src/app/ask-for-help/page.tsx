'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Suggestion = {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  avatar_url: string | null;
  created_at: string;
  like_count: number;
  share_count: number;
  user_liked: boolean;
};

type HelpRequest = {
  id: string;
  author_id: string;
  author_name: string;
  avatar_url: string | null;
  title: string;
  body: string | null;
  category_slug: string | null;
  created_at: string;
  suggestions: Suggestion[];
  suggestions_count: number;
};

const HELP_CATEGORIES: { slug: string; name: string; icon: string }[] = [
  { slug: 'beauty', name: 'Beauty & Parlour', icon: '💄' },
  { slug: 'food', name: 'Food & Restaurants', icon: '🍽️' },
  { slug: 'health', name: 'Health & Medical', icon: '🏥' },
  { slug: 'education', name: 'Education', icon: '📚' },
  { slug: 'services', name: 'Services', icon: '🔧' },
  { slug: 'shopping', name: 'Shopping', icon: '🛒' },
  { slug: 'other', name: 'Other', icon: '💬' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString();
}

export default function AskForHelpPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [suggestionInput, setSuggestionInput] = useState<Record<string, string>>({});
  const [submittingSuggestion, setSubmittingSuggestion] = useState<string | null>(null);
  const [likingFor, setLikingFor] = useState<string | null>(null);
  const [localLikes, setLocalLikes] = useState<Record<string, { count: number; liked: boolean }>>({});

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/help');
      const data = await res.json();
      if (res.status === 401) {
        router.push('/login?next=/ask-for-help');
        return;
      }
      setRequests(data.requests ?? []);
      const likes: Record<string, { count: number; liked: boolean }> = {};
      for (const r of data.requests ?? []) {
        for (const s of r.suggestions ?? []) {
          likes[s.id] = { count: s.like_count ?? 0, liked: s.user_liked ?? false };
        }
      }
      setLocalLikes(likes);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || undefined,
          category_slug: category || undefined,
        }),
      });
      if (res.status === 401) {
        router.push('/login?next=/ask-for-help');
        return;
      }
      if (res.ok) {
        setTitle('');
        setBody('');
        setCategory('');
        setShowForm(false);
        loadRequests();
      } else {
        const data = await res.json();
        alert(data.error ?? 'Failed to post');
      }
    } catch {
      alert('Failed to post');
    } finally {
      setSubmitting(false);
    }
  };

  const submitSuggestion = async (requestId: string) => {
    const content = suggestionInput[requestId]?.trim();
    if (!content) return;
    setSubmittingSuggestion(requestId);
    try {
      const res = await fetch(`/api/help/${requestId}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        router.push('/login?next=/ask-for-help');
        return;
      }
      const data = await res.json();
      if (res.ok && data.suggestion) {
        setSuggestionInput((prev) => ({ ...prev, [requestId]: '' }));
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  suggestions: [...r.suggestions, data.suggestion],
                  suggestions_count: r.suggestions_count + 1,
                }
              : r
          )
        );
      }
    } catch {
      alert('Failed to add suggestion');
    } finally {
      setSubmittingSuggestion(null);
    }
  };

  const toggleLike = async (suggestionId: string) => {
    setLikingFor(suggestionId);
    try {
      const res = await fetch(`/api/help/suggestions/${suggestionId}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLocalLikes((prev) => ({
          ...prev,
          [suggestionId]: { count: data.like_count ?? 0, liked: data.liked ?? false },
        }));
      }
    } finally {
      setLikingFor(null);
    }
  };

  const handleShare = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/help/suggestions/${suggestionId}/share`, { method: 'POST' });
      if (res.ok && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Madadgar - Suggestion',
          text: 'Check out this suggestion on Madadgar',
          url: window.location.href,
        });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="sticky top-0 z-40 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white shadow-lg pt-[env(safe-area-inset-top)]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Link href="/feed" className="flex items-center gap-2 shrink-0">
              <Image src="/logo.png" alt="Madadgar" width={26} height={26} className="rounded" />
              <span className="font-bold text-sm sm:text-base hidden sm:inline">Madadgar</span>
            </Link>
            <h1 className="text-base sm:text-lg font-semibold flex-1 text-center">Ask for Help</h1>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-medium shrink-0"
            >
              {showForm ? 'Cancel' : '+ Ask'}
            </button>
          </div>
          <p className="text-xs text-brand-100 mt-1">
            Suggestions maangain — jaan kar jawab dein (e.g. best beauty parlour?)
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {showForm && (
          <form onSubmit={submitRequest} className="mb-6 p-4 rounded-2xl bg-white border border-stone-200 shadow-premium">
            <input
              type="text"
              placeholder="e.g. Best beauty parlour in Lahore?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 outline-none"
              maxLength={200}
              required
            />
            <textarea
              placeholder="Optional details..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-3 w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 outline-none resize-none"
              rows={2}
              maxLength={2000}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-3 w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500/25 outline-none"
            >
              <option value="">Category (optional)</option>
              {HELP_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="mt-4 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
            <div className="text-5xl mb-4">💡</div>
            <p className="font-semibold text-stone-800">No questions yet</p>
            <p className="text-sm text-stone-500 mt-1">Be the first to ask for suggestions!</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-6 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700"
            >
              Ask for Help
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <article
                key={req.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-premium overflow-hidden"
              >
                <div className="p-4 border-b border-stone-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0">
                      {req.avatar_url ? (
                        <Image src={req.avatar_url} alt="" width={40} height={40} className="object-cover" unoptimized />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-lg">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900">{req.author_name}</p>
                      <h2 className="text-base font-semibold text-stone-800 mt-1">{req.title}</h2>
                      {req.body && <p className="text-sm text-stone-600 mt-1">{req.body}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        {req.category_slug && (
                          <span className="text-xs px-2 py-0.5 rounded-lg bg-stone-100 text-stone-600">
                            {HELP_CATEGORIES.find((c) => c.slug === req.category_slug)?.icon}{' '}
                            {HELP_CATEGORIES.find((c) => c.slug === req.category_slug)?.name ?? req.category_slug}
                          </span>
                        )}
                        <span className="text-xs text-stone-400">{formatDate(req.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {req.suggestions.map((s) => {
                    const likeState = localLikes[s.id] ?? { count: s.like_count, liked: s.user_liked };
                    return (
                      <div
                        key={s.id}
                        className="pl-4 border-l-2 border-brand-200 bg-brand-50/50 rounded-r-xl p-3"
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden shrink-0">
                            {s.avatar_url ? (
                              <Image src={s.avatar_url} alt="" width={32} height={32} className="object-cover" unoptimized />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-sm">👤</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-stone-600">{s.author_name}</p>
                            <p className="text-sm text-stone-800 mt-0.5">{s.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <button
                                type="button"
                                onClick={() => toggleLike(s.id)}
                                disabled={likingFor === s.id}
                                className={`flex items-center gap-1 text-xs font-medium ${
                                  likeState.liked ? 'text-red-600' : 'text-stone-500 hover:text-red-500'
                                }`}
                              >
                                <span>{likeState.liked ? '❤️' : '🤍'}</span>
                                <span>{likeState.count}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleShare(s.id)}
                                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700"
                              >
                                <span>↗</span> Share
                              </button>
                              <span className="text-xs text-stone-400">{formatDate(s.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add your suggestion..."
                      value={suggestionInput[req.id] ?? ''}
                      onChange={(e) =>
                        setSuggestionInput((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          submitSuggestion(req.id);
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => submitSuggestion(req.id)}
                      disabled={
                        submittingSuggestion === req.id || !(suggestionInput[req.id]?.trim())
                      }
                      className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                    >
                      {submittingSuggestion === req.id ? '...' : 'Suggest'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
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
        <Link href="/chat" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
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
    </div>
  );
}

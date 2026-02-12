'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FeedHeader } from '@/components/FeedHeader';

const CATEGORY_ICONS: Record<string, string> = {
  mechanic: '🔧',
  electrician: '⚡',
  plumber: '🔩',
  'ac-technician': '❄️',
  cook: '👨‍🍳',
  'fast-foods': '🍔',
  'desi-foods': '🍛',
  biryani: '🍚',
  chinese: '🥡',
  bbq: '🍖',
  sweets: '🍰',
  driver: '🚗',
  cleaner: '🧹',
  carpenter: '🪚',
  painter: '🎨',
  'mobile-repair': '📱',
  'computer-it': '💻',
  'emergency-helper': '🚨',
};

type PostDetail = {
  id: string;
  author_id: string;
  author_name: string;
  author_verified?: boolean;
  category_name: string;
  post_type: string;
  worker_name: string | null;
  phone: string;
  area_text: string | null;
  reason: string | null;
  relation_tag: string | null;
  intro: string | null;
  images: string[];
  availability: boolean;
  optional_rate: string | null;
  madad_count: number;
  like_count: number;
  dislike_count: number;
  avg_rating: number | null;
  reviews_count: number;
  reviews: { rating: number; review_text: string | null; rater_name: string; created_at: string }[];
  created_at: string;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/posts/${id}/detail`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) setPost(d.post);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (post) {
      fetch(`/api/posts/${id}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [post, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <p className="text-stone-600">Post not found</p>
        <Link href="/feed" className="mt-4 text-brand-600 font-medium">← Back to Feed</Link>
      </div>
    );
  }

  const catSlug = post.category_name?.toLowerCase().replace(/\s+/g, '-') ?? '';
  const icon = CATEGORY_ICONS[catSlug] ?? '🔧';

  return (
    <div className="min-h-screen bg-slate-50">
      <FeedHeader />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <article className="bg-white rounded-2xl border border-slate-100 shadow-premium overflow-hidden">
          {post.images?.length > 0 && (
            <div className="aspect-video bg-stone-100 relative">
              <Image src={post.images[0]} alt="" fill className="object-cover" unoptimized loading="lazy" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-emerald-50 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] flex items-center justify-center text-3xl border border-slate-100/80">
                {icon}
                {post.author_verified && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-xs">✓</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {post.post_type === 'recommendation' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">👍 Recommended</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-100 text-brand-800">🔧 Worker</span>
                  )}
                  {post.availability && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available
                    </span>
                  )}
                  {post.author_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-stone-900 mt-2">
                  {post.worker_name || 'Helper'} — {post.category_name}
                </h1>
                <Link href={`/profile/${post.author_id}`} className="text-sm text-stone-500 mt-1 block hover:text-brand-600">
                  Posted by {post.author_name}
                </Link>
                {post.area_text && <p className="text-sm text-stone-600 mt-2">📍 {post.area_text}</p>}
              </div>
            </div>
            {(post.reason || post.relation_tag || post.intro) && (
              <p className="mt-4 text-stone-600 leading-relaxed">
                {post.reason ?? post.relation_tag ?? post.intro}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-amber-600 font-bold">⭐ {post.avg_rating ?? '—'}</span>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch(`/api/posts/${id}/reaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reaction: 'like' }),
                  });
                  const data = await res.json();
                  if (res.ok && data.like_count != null) {
                    setPost((p) => p ? { ...p, like_count: data.like_count, dislike_count: data.dislike_count ?? p.dislike_count } : null);
                  } else if (res.status === 401) {
                    router.push(`/login?next=/post/${id}`);
                  }
                }}
                className="flex items-center gap-1 text-stone-500 hover:text-brand-600 transition"
              >
                <span>👍</span>
                <span>{post.like_count}</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch(`/api/posts/${id}/reaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reaction: 'dislike' }),
                  });
                  const data = await res.json();
                  if (res.ok && data.dislike_count != null) {
                    setPost((p) => p ? { ...p, like_count: data.like_count ?? p.like_count, dislike_count: data.dislike_count } : null);
                  } else if (res.status === 401) {
                    router.push(`/login?next=/post/${id}`);
                  }
                }}
                className="flex items-center gap-1 text-stone-500 hover:text-red-600 transition"
              >
                <span>👎</span>
                <span>{post.dislike_count}</span>
              </button>
              <span className="text-stone-500">Reviews {post.reviews_count}</span>
            </div>
            {post.reviews?.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-stone-900">Reviews</h3>
                {post.reviews.slice(0, 5).map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex justify-between">
                      <span className="font-medium text-stone-800">{r.rater_name}</span>
                      <span className="text-amber-600 font-bold">⭐ {r.rating}/10</span>
                    </div>
                    {r.review_text && <p className="mt-2 text-sm text-stone-600">{r.review_text}</p>}
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${id}` : '';
                  if (navigator.share && typeof navigator.share === 'function') {
                    try {
                      await navigator.share({
                        title: `${post.worker_name || 'Helper'} — ${post.category_name}`,
                        url,
                        text: post.reason ?? post.relation_tag ?? post.intro ?? '',
                      });
                    } catch {
                      await navigator.clipboard?.writeText(url);
                      alert('Link copied!');
                    }
                  } else {
                    await navigator.clipboard?.writeText(url);
                    alert('Link copied!');
                  }
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
              >
                📤 Share
              </button>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item_type: 'post', item_id: post.id }),
                  });
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50"
              >
                💾 Save
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Report this post?')) {
                    await fetch('/api/reports', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ post_id: post.id }),
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-red-50 hover:text-red-600"
              >
                Report
              </button>
            </div>
            <div className="mt-4">
              <a
                href={`tel:${post.phone}`}
                className="block w-full py-4 rounded-xl bg-brand-600 text-white text-center font-semibold hover:bg-brand-700 shadow-premium-brand hover:shadow-premium-brand-hover transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call
              </a>
            </div>
          </div>
        </article>
        <Link href="/feed" className="mt-6 inline-block text-brand-600 font-medium hover:underline">
          ← Back to Feed
        </Link>
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ImageLightbox } from '@/components/ImageLightbox';

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  area: string | null;
  city: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  marital_status?: string | null;
  is_worker: boolean;
  worker_skill: string | null;
  trust_score: number;
  recommendations_count: number;
  created_at: string;
  about_visibility?: 'public' | 'private';
  phone_visibility?: 'public' | 'private';
  email_visibility?: 'public' | 'private';
  bio_visibility?: 'public' | 'private';
};

type PostItem = {
  id: string;
  author_id: string;
  category_name: string;
  worker_name: string | null;
  phone: string;
  area_text: string | null;
  reason: string | null;
  images: string[];
  madad_count: number;
  created_at: string;
  avg_rating: number | null;
  rec_count: number;
};

type User = {
  id: string;
  email: string | null;
  phone: string | null;
};

type RecItem = {
  id: string;
  worker_name: string | null;
  category_name: string;
  area_text: string | null;
  reason: string | null;
  madad_count: number;
  created_at: string;
};

function SkillBar({ name, percent, delay }: { name: string; percent: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const t = setTimeout(() => setWidth(percent), 100 + delay);
    return () => clearTimeout(t);
  }, [percent, delay]);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-stone-200 font-medium text-sm">{name}</span>
        <span className="text-white font-bold text-sm">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-stone-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

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

export default function UserProfilePage() {
  const params = useParams();
  const id = (params?.id as string) ?? '';
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [recommendations, setRecommendations] = useState<RecItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user: me } } = await supabase.auth.getUser();
      setCurrentUserId(me?.id ?? null);

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (p) {
        setProfile(p);
        const { data: u } = await supabase
          .from('users')
          .select('id, email, phone')
          .eq('id', p.user_id)
          .single();
        setUser(u ?? null);
      }

      try {
        const [recRes, postsRes, blockRes] = await Promise.all([
          fetch(`/api/profile/${id}/recommendations`),
          fetch(`/api/profile/${id}/posts`),
          me && me.id !== id ? fetch(`/api/blocks?user_id=${id}`) : Promise.resolve(null),
        ]);
        if (blockRes) {
          const blockData = await blockRes.json();
          setIsBlocked(blockData.is_blocked ?? false);
        }
        const recData = await recRes.json();
        const postsData = await postsRes.json();
        setRecommendations(recData.items ?? []);
        setPosts(postsData.items ?? []);
      } catch {
        setRecommendations([]);
        setPosts([]);
      }

      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex flex-col items-center justify-center p-6">
        <p className="text-stone-600">Profile not found</p>
        <Link href="/feed" className="mt-4 text-brand-600">Back to Feed</Link>
      </main>
    );
  }

  const isOwnProfile = currentUserId === profile.user_id;
  const displayName = profile.display_name || user?.email?.split('@')[0] || 'User';

  const skills = (() => {
    const trustPct = typeof profile.trust_score === 'number' ? Math.min(95, Math.max(65, profile.trust_score * 10)) : 75;
    const defaults = [
      { name: 'Service Quality', percent: 85 },
      { name: 'Trust Score', percent: trustPct },
      { name: 'Community Help', percent: Math.min(90, 65 + recommendations.length * 5) },
    ];
    if (profile.worker_skill) {
      const parts = profile.worker_skill.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        return parts.slice(0, 3).map((name, i) => ({ name, percent: 75 + (i + 1) * 5 }));
      }
      return [...parts.map((name, i) => ({ name, percent: 80 + i * 5 })), ...defaults.slice(parts.length)].slice(0, 3);
    }
    return defaults;
  })();

  const avatarUrl = profile.avatar_url ?? (user ? null : null);
  const coverUrl = profile.cover_url;

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded" />
              <span className="font-bold text-stone-900">Madadgar</span>
            </Link>
            <h1 className="text-lg font-semibold text-stone-900 truncate max-w-[140px]">{displayName}</h1>
            {isOwnProfile ? (
              <Link href="/profile/edit" className="text-sm font-medium text-brand-600">Edit</Link>
            ) : currentUserId ? (
              <button
                type="button"
                onClick={async () => {
                  setBlockLoading(true);
                  try {
                    if (isBlocked) {
                      await fetch(`/api/blocks?user_id=${id}`, { method: 'DELETE' });
                      setIsBlocked(false);
                    } else {
                      await fetch('/api/blocks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: id }),
                      });
                      setIsBlocked(true);
                    }
                  } finally {
                    setBlockLoading(false);
                  }
                }}
                disabled={blockLoading}
                className={`text-sm font-medium ${isBlocked ? 'text-stone-500 hover:text-brand-600' : 'text-red-600 hover:text-red-700'}`}
              >
                {blockLoading ? '...' : isBlocked ? 'Unblock' : 'Block'}
              </button>
            ) : (
              <div className="w-12" />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* Cover photo - Facebook style, click to enlarge */}
        <button
          type="button"
          className="relative h-48 sm:h-56 bg-gradient-to-br from-brand-600 to-brand-800 overflow-hidden block w-full cursor-pointer"
          onClick={() => coverUrl && setLightboxImage(coverUrl)}
        >
          {coverUrl ? (
            <Image src={coverUrl} alt="Cover" fill className="object-cover hover:opacity-95 transition" unoptimized />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" />
          )}
        </button>

        {/* Avatar overlapping cover - click to enlarge */}
        <div className="px-4 -mt-16 relative z-10">
          <button
            type="button"
            className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white block cursor-pointer hover:ring-2 hover:ring-brand-400 hover:ring-offset-2 transition"
            onClick={() => avatarUrl && setLightboxImage(avatarUrl)}
          >
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} width={112} height={112} className="object-cover w-full h-full" unoptimized />
            ) : (
              <div className="w-full h-full bg-stone-200 flex items-center justify-center text-4xl">👤</div>
            )}
          </button>
        </div>

        {lightboxImage && (
          <ImageLightbox src={lightboxImage} alt={displayName} onClose={() => setLightboxImage(null)} />
        )}

        <div className="px-4 pt-4 pb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <h1 className="text-xl font-semibold text-brand-900">{displayName}</h1>
          {(profile.area || profile.city) && (
            <p className="mt-2 text-stone-600">
              {[profile.area, profile.city].filter(Boolean).join(', ')}
            </p>
          )}
          {(profile as { bio?: string }).bio && (isOwnProfile || (profile.bio_visibility ?? 'public') === 'public') && (
            <p className="mt-3 text-stone-600 text-sm leading-relaxed">{(profile as { bio?: string }).bio}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-stone-500">Trust score</p>
                <p className="font-medium">{profile.trust_score ?? '—'}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Recommendations</p>
                <p className="font-medium">{recommendations.length}</p>
              </div>
            </div>
            {!isOwnProfile && currentUserId && (
              <button
                type="button"
                onClick={async () => {
                  setMessageLoading(true);
                  try {
                    const res = await fetch('/api/chat/threads', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ user_id: profile.user_id }),
                    });
                    const data = await res.json();
                    if (res.status === 401) {
                      router.push(`/login?next=${encodeURIComponent(`/profile/${id}`)}`);
                      return;
                    }
                    if (data.thread?.id) {
                      router.push(`/chat/${data.thread.id}`);
                    } else if (data.error) {
                      console.error(data.error);
                    }
                  } finally {
                    setMessageLoading(false);
                  }
                }}
                disabled={messageLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {messageLoading ? '...' : 'Message'}
              </button>
            )}
          </div>
        </div>

        {/* About section - collapsible, per-item visibility */}
        {(isOwnProfile || (profile.about_visibility ?? 'public') === 'public') && (
          <section id="about" className="bg-white rounded-2xl shadow-sm border border-stone-100 mb-6 overflow-hidden">
            <button
              type="button"
              onClick={() => setAboutExpanded((e) => !e)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-stone-50/50 transition"
            >
              <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2">
                <span>ℹ️</span>
                About
              </h2>
              <svg className={`w-5 h-5 text-stone-500 transition-transform ${aboutExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {aboutExpanded && (
              <div className="px-6 pb-6 pt-0 space-y-3 border-t border-stone-100">
                {user?.phone && (isOwnProfile || (profile.phone_visibility ?? 'public') === 'public') && (
                  <div>
                    <p className="text-sm text-stone-500">Phone</p>
                    <a href={`tel:${user.phone}`} className="font-medium text-brand-700 hover:underline">{user.phone}</a>
                  </div>
                )}
                {user?.email && (isOwnProfile || (profile.email_visibility ?? 'public') === 'public') && (
                  <div>
                    <p className="text-sm text-stone-500">Email</p>
                    <a href={`mailto:${user.email}`} className="font-medium text-brand-700 hover:underline">{user.email}</a>
                  </div>
                )}
                {(!user?.phone && !user?.email) && (
                  <p className="text-stone-500 text-sm">Contact info available nahi</p>
                )}
                {!isOwnProfile && user && (user.phone || user.email) && !(user?.phone && (profile.phone_visibility ?? 'public') === 'public') && !(user?.email && (profile.email_visibility ?? 'public') === 'public') && (
                  <p className="text-stone-500 text-sm">Contact info private rakha gaya</p>
                )}
              </div>
            )}
          </section>
        )}

        <section className="bg-stone-900 rounded-2xl p-6 shadow-lg border border-stone-700 mb-6 overflow-hidden">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2 mb-4">
            <span>📊</span>
            Skill Share
          </h2>
          <div className="space-y-4">
            {skills.map((skill, i) => (
              <SkillBar key={i} name={skill.name} percent={skill.percent} delay={i * 150} />
            ))}
          </div>
        </section>

        {/* Posts - feed style (jo main feed mein post kiya) */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2 mb-4">
            <span>📄</span>
            {isOwnProfile ? 'Meri posts' : `${displayName} ki posts`}
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
              <p className="text-stone-500">
                {isOwnProfile ? 'Abhi tak koi post nahi' : 'Is user ne abhi tak koi post nahi kiya'}
              </p>
              {isOwnProfile && (
                <Link href="/post" className="mt-4 inline-block px-6 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">
                  Post karein
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {CATEGORY_ICONS[post.category_name?.toLowerCase().replace(/\s+/g, '-')] ?? '🔧'}
                      </span>
                      <div>
                        <h3 className="font-bold text-stone-900">{post.worker_name || 'Helper'} — {post.category_name}</h3>
                        {post.area_text && <p className="text-sm text-stone-500">{post.area_text}</p>}
                      </div>
                    </div>
                    {post.reason && (
                      <p className="mt-2 text-sm text-stone-600 line-clamp-2">{post.reason}</p>
                    )}
                    {post.images?.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {post.images.slice(0, 3).map((img, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                            <Image src={img} alt="" fill className="object-cover" unoptimized loading="lazy" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
                      {post.avg_rating != null && <span>⭐ {post.avg_rating}</span>}
                      <span>❤️ {post.rec_count} madad</span>
                      <span>{new Date(post.created_at).toLocaleDateString('en-PK')}</span>
                    </div>
                    <a
                      href={`tel:${post.phone}`}
                      className="mt-3 block w-full py-2.5 rounded-xl bg-brand-600 text-white text-center font-medium text-sm hover:bg-brand-700"
                    >
                      Call
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2">
            <span>👍</span>
            {isOwnProfile ? 'Meri recommendations' : `${displayName} ne kahan recommend kiya hai`}
          </h2>

          {recommendations.length === 0 ? (
            <p className="mt-4 text-stone-500 text-center py-6">
              {isOwnProfile ? 'Abhi tak koi recommendation nahi' : 'Is user ne abhi tak koi recommendation nahi di'}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href="/feed"
                  className="block p-4 rounded-xl border border-stone-100 hover:border-brand-200 hover:bg-brand-50/30 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[rec.category_name?.toLowerCase().replace(/\s+/g, '-')] ?? '🔧'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-900">
                        {rec.worker_name || 'Helper'} — {rec.category_name}
                      </p>
                      {rec.area_text && (
                        <p className="text-sm text-stone-500">{rec.area_text}</p>
                      )}
                      {rec.reason && (
                        <p className="text-sm text-stone-600 mt-1 line-clamp-2">{rec.reason}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-2">
                        {new Date(rec.created_at).toLocaleDateString('en-PK')} • Madad ki {rec.madad_count}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Link href="/feed" className="block text-center text-brand-600 font-medium hover:underline pb-8">
          ← Back to Feed
        </Link>
        </div>
      </main>
    </div>
  );
}

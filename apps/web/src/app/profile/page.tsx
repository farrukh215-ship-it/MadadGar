'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ImageCarousel } from '@/components/ImageCarousel';

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
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-stone-200 font-medium text-sm">{name}</span>
        <span className="text-white font-bold text-sm">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-stone-700 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

type RecItem = {
  id: string;
  worker_name: string | null;
  category_name: string;
  area_text: string | null;
  reason: string | null;
  madad_count: number;
  created_at: string;
};

const CATEGORY_ICONS: Record<string, string> = {
  mechanic: '🔧',
  electrician: '⚡',
  plumber: '🔩',
  'ac-technician': '❄️',
  cook: '👨‍🍳',
  driver: '🚗',
  cleaner: '🧹',
  carpenter: '🪚',
  painter: '🎨',
  'mobile-repair': '📱',
  'computer-it': '💻',
  'emergency-helper': '🚨',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; phone?: string } | null>(null);
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string | null; cover_url?: string | null; trust_score?: number; worker_skill?: string | null; verified?: boolean } | null>(null);
  const [recommendations, setRecommendations] = useState<RecItem[]>([]);
  const [posts, setPosts] = useState<RecItem[]>([]);
  const [sales, setSales] = useState<{ id: string; title: string; price: number; images?: string[]; category_name?: string; category_slug?: string; created_at: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; price_min?: number; price_max?: number; images?: string[]; category_name?: string; category_slug?: string; created_at: string }[]>([]);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ best_time_to_post?: { day_label: string; hour_label: string }; insights?: string[] } | null>(null);

  useEffect(() => {
    (async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const { data: uData } = await supabase.from('users').select('id, email, phone').eq('id', u.id).single();
        setUser(uData ? { id: u.id, email: uData.email ?? undefined, phone: uData.phone ?? undefined } : { id: u.id, email: u.email ?? undefined });
        const { data: p } = await supabase.from('profiles').select('display_name, avatar_url, cover_url, trust_score, worker_skill, verified').eq('user_id', u.id).single();
        setProfile(p ?? null);
        try {
          const [recRes, postsRes, listingsRes, completeRes, premRes, insightsRes] = await Promise.all([
            fetch(`/api/profile/${u.id}/recommendations`),
            fetch(`/api/profile/${u.id}/posts`),
            fetch('/api/profile/my-listings'),
            fetch('/api/profile/complete'),
            fetch('/api/premium/status'),
            fetch('/api/analytics/insights'),
          ]);
          const insightsData = await insightsRes.json();
          if (insightsRes.ok) setInsights(insightsData);
          const completeData = await completeRes.json();
          const premData = await premRes.json();
          setProfileComplete(completeData.is_complete ?? false);
          setIsPremium(!!premData.is_premium);
          const recData = await recRes.json();
          const postsData = await postsRes.json();
          const listingsData = await listingsRes.json();
          setRecommendations(recData.items ?? []);
          setPosts(postsData.items ?? []);
          setSales(listingsData.sales ?? []);
          setProducts(listingsData.products ?? []);
        } catch {
          setRecommendations([]);
          setPosts([]);
          setSales([]);
          setProducts([]);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-surface-base flex flex-col items-center justify-center p-6">
        <p className="text-stone-600">Please log in to view your profile</p>
        <Link href="/login" className="mt-4 text-brand-600 font-medium">
          Login
        </Link>
      </main>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;
  const coverUrl = profile?.cover_url;

  return (
    <div className="min-h-screen bg-surface-base">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded" />
              <span className="font-bold text-stone-900">Madadgar</span>
            </Link>
            <h1 className="text-lg font-semibold text-stone-900">My Profile</h1>
            <Link href="/profile/edit" className="text-sm font-medium text-brand-600">Edit</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-[max(5rem,env(safe-area-inset-bottom))]">
        {/* Cover - click to enlarge */}
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

        {/* Avatar - click to enlarge */}
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

        <div className="pt-4 pb-6">
        {!profileComplete && (
          <Link
            href="/profile/edit"
            className="block mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-800 animate-fade-in"
          >
            <p className="font-semibold">Complete your profile</p>
            <p className="text-sm mt-1 opacity-90">Add name, photo & bio to get the most from Madadgar</p>
          </Link>
        )}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <h2 className="text-lg font-semibold text-stone-900">{displayName}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {profile?.verified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                ✓ Verified
              </span>
            )}
            {profileComplete && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                ✓ Profile Complete
              </span>
            )}
            {isPremium && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium">
                ★ Premium
              </span>
            )}
            <Link href={`/profile/${user.id}`} className="text-brand-600 font-medium hover:underline">
              Public profile →
            </Link>
            <Link href="/premium" className="text-amber-600 font-medium hover:underline">
              ★ Premium
            </Link>
          </div>
          {insights?.insights?.length ? (
            <div className="mt-4 p-4 rounded-xl bg-brand-50/80 border border-brand-100">
              <h3 className="text-sm font-semibold text-brand-900 mb-2">📊 Insights</h3>
              <ul className="text-sm text-brand-800 space-y-1">
                {insights.insights.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {!profile?.verified && (
            <Link href="/profile/verify" className="mt-2 inline-block text-amber-600 font-medium hover:underline">
              Get verified →
            </Link>
          )}
        </div>

        {/* About section - phone & email */}
        <section id="about" className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-6">
          <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2 mb-4">
            <span>ℹ️</span>
            About
          </h2>
          <div className="space-y-3">
            {user?.phone && (
              <div>
                <p className="text-sm text-stone-500">Phone</p>
                <a href={`tel:${user.phone}`} className="font-medium text-brand-700 hover:underline">{user.phone}</a>
              </div>
            )}
            {user?.email && (
              <div>
                <p className="text-sm text-stone-500">Email</p>
                <a href={`mailto:${user.email}`} className="font-medium text-brand-700 hover:underline">{user.email}</a>
              </div>
            )}
            {(!user?.phone && !user?.email) && (
              <p className="text-stone-500 text-sm">Contact info available nahi</p>
            )}
          </div>
        </section>

        <section className="bg-stone-900 rounded-2xl p-6 shadow-lg border border-stone-700 mb-6 overflow-hidden">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2 mb-4">
            <span>📊</span>
            Skill Share
          </h2>
          <div className="space-y-4">
            {(() => {
              const p = profile ?? {};
              const trustPct = typeof p.trust_score === 'number' ? Math.min(95, Math.max(65, p.trust_score * 10)) : 75;
              let skills: { name: string; percent: number }[] = p.worker_skill
                ? p.worker_skill.split(/[,;]/).map((s) => s.trim()).filter(Boolean).slice(0, 3).map((name, i) => ({ name, percent: 75 + (i + 1) * 5 }))
                : [
                    { name: 'Service Quality', percent: 85 },
                    { name: 'Trust Score', percent: trustPct },
                    { name: 'Community Help', percent: Math.min(90, 65 + recommendations.length * 5) },
                  ];
              while (skills.length < 3) skills.push({ name: 'Skill', percent: 80 });
              return skills.slice(0, 3).map((s, i) => <SkillBar key={i} name={s.name} percent={s.percent} delay={i * 150} />);
            })()}
          </div>
        </section>

        {/* My posts */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2 mb-4">
            <span>📄</span>
            Meri posts
          </h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-100">
              <p className="text-stone-500">Abhi tak koi post nahi</p>
              <Link href="/post" className="mt-4 inline-block px-6 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">
                Post karein
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((rec) => (
                <Link
                  key={rec.id}
                  href="/feed"
                  className="block p-4 rounded-xl bg-white border border-stone-100 hover:border-brand-200 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[rec.category_name?.toLowerCase().replace(/\s+/g, '-')] ?? '🔧'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-900">
                        {rec.worker_name || 'Helper'} — {rec.category_name}
                      </p>
                      {rec.area_text && <p className="text-sm text-stone-500">{rec.area_text}</p>}
                      {rec.reason && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{rec.reason}</p>}
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

        {/* Used Items & Products */}
        {(sales.length > 0 || products.length > 0) && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2 mb-4">
              <span>📦</span>
              Meri Used Items & Products
            </h2>
            <div className="space-y-4">
              {sales.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-stone-600 mb-2">Used Items</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sales.map((s) => (
                      <div key={s.id} className="relative group">
                        <Link
                          href={`/sale/${s.id}`}
                          className="block p-3 rounded-xl bg-white border border-stone-100 hover:border-brand-200 hover:shadow-md transition"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden mb-2">
                            {(s.images?.length ?? 0) >= 2 ? (
                              <ImageCarousel images={s.images!} alt={s.title} fallbackIcon="💰" variant="compact" objectFit="cover" />
                            ) : s.images?.[0] ? (
                              <Image src={s.images[0]} alt="" width={120} height={120} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-stone-100">💰</div>
                            )}
                          </div>
                          <p className="font-medium text-stone-900 text-sm line-clamp-1">{s.title}</p>
                          <p className="text-brand-600 font-bold text-xs">Rs {s.price?.toLocaleString()}</p>
                        </Link>
                        <Link
                          href={`/sale/${s.id}/edit`}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition shadow-sm"
                        >
                          ✏️ Edit
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {products.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-stone-600 mb-2">Products</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        className="block p-3 rounded-xl bg-white border border-stone-100 hover:border-brand-200 hover:shadow-md transition"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2">
                          {(p.images?.length ?? 0) >= 2 ? (
                            <ImageCarousel images={p.images!} alt={p.name} fallbackIcon="📦" variant="compact" objectFit="cover" />
                          ) : p.images?.[0] ? (
                            <Image src={p.images[0]} alt="" width={120} height={120} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-stone-100">📦</div>
                          )}
                        </div>
                        <p className="font-medium text-stone-900 text-sm line-clamp-1">{p.name}</p>
                        <p className="text-brand-600 font-bold text-xs">Rs {(p.price_min ?? 0).toLocaleString()}+</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-semibold text-brand-900 flex items-center gap-2">
            <span>👍</span>
            Meri recommendations
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Aap ne in logo ko recommend kiya hai
          </p>

          {recommendations.length === 0 ? (
            <div className="mt-6 py-8 text-center text-stone-500">
              <p>Abhi tak koi recommendation nahi</p>
              <Link
                href="/post"
                className="mt-4 inline-block px-6 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700"
              >
                Pehli recommendation post karein
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/feed`}
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

        <button
          onClick={handleLogout}
          className="mt-6 w-full py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
        >
          Logout
        </button>
        </div>
      </main>

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
          Create
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-brand-600 font-semibold">
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

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FeedHeader } from '@/components/FeedHeader';
import { FeedSidebar, type SidebarFilter } from '@/components/FeedSidebar';
import { MessengerPanel } from '@/components/MessengerPanel';

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
  'generator-tech': '🔌',
  welder: '🔥',
  'mobile-repair': '📱',
  'computer-it': '💻',
  'emergency-helper': '🚨',
};

type FeedItem = {
  id: string;
  item_type?: 'post' | 'product' | 'sale';
  author_id?: string;
  author_name?: string;
  category_name?: string;
  post_type?: string;
  worker_name?: string | null;
  phone?: string;
  area_text?: string | null;
  reason?: string | null;
  relation_tag?: string | null;
  madad_count?: number;
  distance_m?: number;
  avg_rating?: number;
  rec_count?: number;
  like_count?: number;
  dislike_count?: number;
  reviews_count?: number;
  comments_count?: number;
  availability?: boolean;
  created_at: string;
  name?: string;
  title?: string;
  price?: number;
  price_min?: number;
  price_max?: number;
  images?: string[];
  link_url?: string;
  category_slug?: string;
};

const FOOD_SLUGS = ['cook', 'fast-foods', 'desi-foods', 'biryani', 'chinese', 'bbq', 'sweets'];

const CATEGORY_TO_FILTER: Record<string, SidebarFilter> = {
  'trusted-helpers': 'trusted-helpers',
  'food-points': 'food-points',
  'used-products': 'sale',
};

const CATEGORY_TO_SLUG: Record<string, string> = {
  'Trusted Helpers': 'trusted-helpers',
  'Food Points': 'food-points',
  'Products': 'products',
  'Used Products': 'used-products',
};

function getParentCategorySlug(categoryName: string): string | null {
  const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
  if (CATEGORY_TO_SLUG[categoryName]) return null;
  return FOOD_SLUGS.some((s) => slug.includes(s)) ? 'food-points' : 'trusted-helpers';
}

const FEED_LIMIT_PER_CATEGORY = 6;

export default function FeedPage() {
  const searchParams = useSearchParams();
  const catFromUrl = searchParams.get('c');
  const initialFilter = (catFromUrl && CATEGORY_TO_FILTER[catFromUrl]) ? CATEGORY_TO_FILTER[catFromUrl] : 'all';
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>(initialFilter);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [messengerOpen, setMessengerOpen] = useState(false);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
        },
        () => {
          setLat(31.5204);
          setLng(74.3587);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    } else {
      setLat(31.5204);
      setLng(74.3587);
    }
  }, []);

  const refetchFeed = useCallback(async () => {
    const id = ++fetchIdRef.current;
    setLoading(true);
    try {
      const latVal = lat ?? 31.52;
      const lngVal = lng ?? 74.35;
      let url = '';
      if (sidebarFilter === 'all' || sidebarFilter === 'trusted-helpers' || sidebarFilter === 'food-points' || sidebarFilter === 'nearby' || sidebarFilter === 'top-rated' || sidebarFilter === 'verified') {
        if (sidebarFilter === 'all') {
          url = `/api/feed/all-combined?lat=${latVal}&lng=${lngVal}`;
        } else if (sidebarFilter === 'top-rated') {
          url = '/api/feed/top-rated';
        } else {
          url = `/api/feed/nearby?lat=${latVal}&lng=${lngVal}&radius=${sidebarFilter === 'nearby' ? 5000 : 100000}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (id !== fetchIdRef.current) return;
        const newItems = data.items ?? [];
        setItems((prev) => (newItems.length > 0 ? newItems : prev));
      } else if (sidebarFilter === 'sale') {
        const res = await fetch('/api/sale');
        const data = await res.json();
        if (id !== fetchIdRef.current) return;
        const sales = (data.items ?? []).map((s: Record<string, unknown>) => ({ ...s, item_type: 'sale' }));
        setItems((prev) => (sales.length > 0 ? sales : prev));
      }
    } catch (e) {
      if (id !== fetchIdRef.current) return;
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [sidebarFilter, lat, lng]);

  useEffect(() => {
    refetchFeed();
  }, [refetchFeed]);

  const categoryFromUrl = searchParams.get('c');
  const subFromUrl = searchParams.get('sub');
  const isCategoryView = Boolean(categoryFromUrl && CATEGORY_TO_FILTER[categoryFromUrl]);
  const isSubcategoryView = Boolean(subFromUrl);

  const formatDistance = (m?: number) => {
    if (m == null) return '';
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  };

  const filteredItems = items.filter((i) => {
    const matchSearch = !search ||
      [i.category_name, i.worker_name, i.area_text, i.reason, i.name, i.title].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase());
    const itemType = i.item_type ?? 'post';
    const catSlug = (i.category_name ?? i.category_slug ?? '').toLowerCase().replace(/\s+/g, '-');
    const isFoodPost = FOOD_SLUGS.some((s) => catSlug.includes(s)) || [i.category_name, i.worker_name, i.area_text, i.reason].join(' ').toLowerCase().includes('food');
    const isWorkerPost = itemType === 'post' && !isFoodPost;

    if (sidebarFilter === 'trusted-helpers') {
      if (itemType !== 'post' || isFoodPost) return false;
    } else if (sidebarFilter === 'food-points') {
      if (itemType !== 'post' || !isFoodPost) return false;
    } else if (sidebarFilter === 'sale') {
      if (itemType !== 'sale') return false;
    } else if (sidebarFilter === 'nearby') {
      if (itemType !== 'post' || (i.distance_m == null || i.distance_m > 5000)) return false;
    } else if (sidebarFilter === 'top-rated') {
      if (itemType !== 'post' || (i.avg_rating == null || i.avg_rating < 4)) return false;
    } else if (sidebarFilter === 'verified') {
      if (itemType !== 'post' || (i.rec_count == null || i.rec_count === 0)) return false;
    }
    return matchSearch;
  });

  // Group by category (OLX style) - category bold, feeds below in 3 columns
  const grouped = filteredItems.reduce<Record<string, FeedItem[]>>((acc, item) => {
    const itemType = item.item_type ?? 'post';
    const catSlug = (item.category_name ?? item.category_slug ?? '').toLowerCase().replace(/\s+/g, '-');
    const isFoodPost = FOOD_SLUGS.some((s) => catSlug.includes(s)) || [item.category_name, item.worker_name, item.area_text, item.reason].join(' ').toLowerCase().includes('food');
    let cat: string;
    if (itemType === 'product') cat = 'Products';
    else if (itemType === 'sale') cat = 'Used Products';
    else if (isFoodPost) cat = 'Food Points';
    else cat = item.category_name || 'Trusted Helpers';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
  let categoryOrder = Object.keys(grouped).sort((a, b) => {
    const priority = ['Trusted Helpers', 'Food Points', 'Products', 'Used Products'];
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });

  if (isSubcategoryView && subFromUrl) {
    const subSlug = subFromUrl.toLowerCase().replace(/\s+/g, '-');
    categoryOrder = categoryOrder.filter((cat) => cat.toLowerCase().replace(/\s+/g, '-') === subSlug);
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <FeedHeader
        onMessengerClick={() => setMessengerOpen(true)}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <MessengerPanel open={messengerOpen} onClose={() => setMessengerOpen(false)} />

      <div className="flex">
        <FeedSidebar
          activeFilter={sidebarFilter}
          onFilterChange={setSidebarFilter}
          onClose={() => setSidebarOpen(false)}
          open={sidebarOpen}
        />

        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-6">
          <div className="max-w-6xl mx-auto">
            {(isCategoryView || isSubcategoryView) && (
              <Link
                href={isSubcategoryView && categoryFromUrl ? `/feed?c=${categoryFromUrl}` : '/feed'}
                className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 mb-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {isSubcategoryView ? 'Back to category' : 'Back to main feed'}
              </Link>
            )}
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search helpers, food, products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 backdrop-blur border border-slate-200/80 shadow-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 text-slate-700 text-sm"
              />
            </div>

            {/* Feed */}
            {loading ? (
              <div className="py-24 text-center animate-fade-in">
                <div className="inline-block w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-slate-500 font-medium">Loading...</p>
                <p className="mt-1 text-sm text-slate-400">Finding trusted helpers near you</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200/80 shadow-premium">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mb-4">🔍</div>
                <p className="text-slate-600 font-medium">No posts nearby</p>
                <p className="mt-1 text-slate-500 text-sm">Be the first to share a trusted helper!</p>
                <Link href="/post" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-premium-brand transition-all hover:shadow-premium-brand-hover">
                  Create
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {categoryOrder.map((categoryName) => {
                  const categoryItems = grouped[categoryName] ?? [];
                  const showAllInSection = isCategoryView || isSubcategoryView;
                  const displayItems = showAllInSection ? categoryItems : categoryItems.slice(0, FEED_LIMIT_PER_CATEGORY);
                  const hasMore = categoryItems.length > FEED_LIMIT_PER_CATEGORY;
                  const viewAllSlug = CATEGORY_TO_SLUG[categoryName];
                  const catSlug = categoryName.toLowerCase().replace(/\s+/g, '-');
                  const catIcon = CATEGORY_ICONS[catSlug] ?? (['cook', 'fast', 'desi', 'biryani', 'chinese', 'bbq', 'sweet', 'food', 'products', 'used'].some((k) => catSlug.includes(k)) ? '📦' : '🔧');

                  const parentSlug = categoryFromUrl ?? getParentCategorySlug(categoryName);
                  const headingHref = viewAllSlug
                    ? (viewAllSlug === 'products' ? '/products' : viewAllSlug === 'used-products' ? '/sale' : `/feed?c=${viewAllSlug}`)
                    : parentSlug
                      ? `/feed?c=${parentSlug}&sub=${catSlug}`
                      : null;

                  return (
                    <section key={categoryName} className="animate-slide-up">
                      <div className="flex items-center justify-between mb-2.5">
                        {headingHref ? (
                          <Link
                            href={headingHref}
                            className="group/head flex items-center gap-2 tracking-tight"
                          >
                            <span className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-sm border border-slate-100 group-hover/head:border-brand-200 transition-colors">
                              {catIcon}
                            </span>
                            <h2 className="text-sm font-bold text-slate-800 group-hover/head:text-brand-600 transition-colors">
                              {categoryName}
                            </h2>
                            <span className="text-[10px] text-slate-400 group-hover/head:text-brand-500 ml-0.5">View all →</span>
                          </Link>
                        ) : (
                          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                            <span className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-sm border border-slate-100">
                              {catIcon}
                            </span>
                            {categoryName}
                          </h2>
                        )}
                        {hasMore && !showAllInSection && headingHref && (
                          <Link href={headingHref} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                            View all
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {displayItems.map((item) => {
                          const itemType = item.item_type ?? 'post';
                          const slug = (item.category_name ?? item.category_slug ?? '').toLowerCase().replace(/\s+/g, '-');
                          const postIcon = CATEGORY_ICONS[slug] ?? (['cook', 'fast', 'desi', 'biryani', 'chinese', 'bbq', 'sweet', 'food'].some((k) => slug.includes(k)) ? '🍽️' : '🔧');
                          const hasImage = !!item.images?.[0];

                          // Product — OLX-style compact
                          if (itemType === 'product') {
                            return (
                              <Link key={item.id} href={`/products/${item.id}`} className="block group">
                                <article className="bg-white rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 border border-slate-100/80 hover:border-slate-200 h-full flex flex-col">
                                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden min-h-[72px]">
                                    {hasImage ? (
                                      <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
                                        <span className="text-2xl opacity-60">📦</span>
                                        <span className="absolute bottom-1 left-1 right-1 text-center text-[10px] font-medium text-slate-500 truncate">{item.category_name}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2 flex-1 flex flex-col min-h-0">
                                    <h3 className="font-semibold text-slate-900 text-xs line-clamp-1">{item.name}</h3>
                                    <p className="text-brand-600 font-bold mt-0.5 text-xs">Rs {item.price_min != null ? item.price_min.toLocaleString() : '0'}+</p>
                                  </div>
                                </article>
                              </Link>
                            );
                          }

                          // Sale — OLX-style compact
                          if (itemType === 'sale') {
                            return (
                              <Link key={item.id} href={`/sale/${item.id}`} className="block group">
                                <article className="bg-white rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 border border-slate-100/80 hover:border-slate-200 h-full flex flex-col">
                                  <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden min-h-[72px]">
                                    {hasImage ? (
                                      <>
                                        <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                        {item.images && item.images.length > 1 && (
                                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium">{item.images.length}</span>
                                        )}
                                      </>
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-slate-50">
                                        <span className="text-2xl opacity-60">💰</span>
                                        <span className="absolute bottom-1 left-1 right-1 text-center text-[10px] font-medium text-slate-500 truncate">{item.category_name || 'Used'}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2 flex-1 flex flex-col min-h-0">
                                    <h3 className="font-semibold text-slate-900 text-xs line-clamp-1">{item.title}</h3>
                                    <p className="text-brand-600 font-bold mt-0.5 text-xs">Rs {item.price?.toLocaleString()}</p>
                                    {item.area_text && <p className="text-[10px] text-slate-500 mt-0.5 truncate">📍 {item.area_text}</p>}
                                  </div>
                                </article>
                              </Link>
                            );
                          }

                          // Post — OLX-style compact box
                          const isEmergency = item.category_name?.toLowerCase().includes('emergency');
                          const isFoodPost = FOOD_SLUGS.some((s) => slug.includes(s)) || [item.category_name, item.worker_name, item.area_text, item.reason].join(' ').toLowerCase().includes('food');

                          return (
                            <article
                              key={item.id}
                              className={`rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-slate-100/80 hover:border-slate-200 ${
                                isEmergency ? 'ring-1 ring-red-200' : ''
                              }`}
                            >
                              <Link href={`/post/${item.id}`} className="flex-1 flex flex-col block group min-h-0">
                                <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden min-h-[72px]">
                                  {hasImage ? (
                                    <>
                                      <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                      <div className="absolute top-1 left-1 flex gap-0.5">
                                        {item.post_type === 'recommendation' ? (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-100/95 text-amber-800">👍</span>
                                        ) : (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-brand-100/95 text-brand-800">🔧</span>
                                        )}
                                        {item.avg_rating != null && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-black/40 text-white">⭐{item.avg_rating}</span>}
                                      </div>
                                      {formatDistance(item.distance_m) && (
                                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black/40 text-white">{formatDistance(item.distance_m)}</span>
                                      )}
                                    </>
                                  ) : (
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${isEmergency ? 'bg-red-50/80' : isFoodPost ? 'bg-gradient-to-br from-violet-100 to-violet-50' : 'bg-gradient-to-br from-teal-50 to-emerald-50'}`}>
                                      <span className="text-2xl opacity-80">{postIcon}</span>
                                      <span className="mt-0.5 text-[10px] font-semibold text-slate-600 truncate max-w-full px-1">{item.category_name}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 flex-1 flex flex-col min-h-0">
                                  <h3 className="font-semibold text-slate-900 text-xs line-clamp-1">{item.worker_name || 'Helper'} — {item.category_name}</h3>
                                  {(item.reason || item.relation_tag) && <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.reason ?? item.relation_tag}</p>}
                                  <div className="mt-1 flex gap-1.5 text-[9px] text-slate-500">
                                    <span>👍 {item.like_count ?? item.madad_count ?? 0}</span>
                                    {(item.reviews_count ?? 0) > 0 && <span>⭐ {item.reviews_count}</span>}
                                  </div>
                                </div>
                              </Link>
                              <div className="px-2 pb-2 pt-0" onClick={(e) => e.stopPropagation()}>
                                <a href={`tel:${item.phone}`} className="block w-full py-1.5 rounded-lg bg-brand-600 text-white text-center text-[11px] font-semibold hover:bg-brand-700 transition-all flex items-center justify-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                  Call
                                </a>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)] flex justify-around py-3 px-2 z-50 safe-area-pb">
        <Link href="/feed" className="flex flex-col items-center gap-1 text-brand-600 font-semibold transition">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/post" className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">Create</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs">Chat</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
      <div className="h-20 lg:hidden" />
    </div>
  );
}

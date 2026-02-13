'use client';

import { useEffect, useState, useRef, useCallback, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UtensilsCrossed, Beef, Cookie, Soup, Flame, Wrench, Zap, Droplets, Snowflake, Car, Sparkles, Hammer, Plug, Smartphone, Laptop, AlertCircle, Package, ShoppingBag, Search } from 'lucide-react';
import { FeedHeader } from '@/components/FeedHeader';
import { ImageCarousel } from '@/components/ImageCarousel';
import { YaariFeedSection } from '@/components/YaariFeedSection';
import { ProfileCompletionBanner } from '@/components/ProfileCompletionBanner';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { useCity } from '@/contexts/CityContext';
import { FeedSidebar, type SidebarFilter } from '@/components/FeedSidebar';
import { FeedCategoryTabs, FeedMoreSheet } from '@/components/FeedCategoryTabs';
import { FeedSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { useDebounce } from '@/hooks/useDebounce';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { hapticLight, hapticMedium } from '@/lib/haptic';

const CATEGORY_ICONS: Record<string, { Icon: React.ComponentType<{ className?: string }>; gradient: string; iconColor: string }> = {
  mechanic: { Icon: Wrench, gradient: 'from-amber-100 to-amber-50', iconColor: 'text-amber-600' },
  electrician: { Icon: Zap, gradient: 'from-yellow-100 to-amber-50', iconColor: 'text-amber-600' },
  plumber: { Icon: Droplets, gradient: 'from-blue-100 to-cyan-50', iconColor: 'text-blue-600' },
  'ac-technician': { Icon: Snowflake, gradient: 'from-cyan-100 to-blue-50', iconColor: 'text-cyan-600' },
  cook: { Icon: UtensilsCrossed, gradient: 'from-orange-100 to-amber-50', iconColor: 'text-orange-600' },
  'fast-foods': { Icon: UtensilsCrossed, gradient: 'from-red-100 to-orange-50', iconColor: 'text-red-600' },
  'desi-foods': { Icon: UtensilsCrossed, gradient: 'from-amber-100 to-yellow-50', iconColor: 'text-amber-700' },
  biryani: { Icon: Soup, gradient: 'from-rose-100 to-orange-50', iconColor: 'text-rose-600' },
  chinese: { Icon: Soup, gradient: 'from-amber-100 to-orange-50', iconColor: 'text-amber-600' },
  bbq: { Icon: Beef, gradient: 'from-orange-100 to-rose-50', iconColor: 'text-orange-600' },
  sweets: { Icon: Cookie, gradient: 'from-pink-100 to-rose-50', iconColor: 'text-pink-600' },
  driver: { Icon: Car, gradient: 'from-slate-100 to-slate-50', iconColor: 'text-stone-600' },
  cleaner: { Icon: Sparkles, gradient: 'from-teal-100 to-emerald-50', iconColor: 'text-teal-600' },
  carpenter: { Icon: Hammer, gradient: 'from-amber-100 to-amber-50', iconColor: 'text-amber-700' },
  painter: { Icon: Sparkles, gradient: 'from-indigo-100 to-violet-50', iconColor: 'text-indigo-600' },
  'generator-tech': { Icon: Plug, gradient: 'from-yellow-100 to-amber-50', iconColor: 'text-amber-600' },
  welder: { Icon: Flame, gradient: 'from-orange-100 to-red-50', iconColor: 'text-orange-600' },
  'mobile-repair': { Icon: Smartphone, gradient: 'from-slate-100 to-slate-50', iconColor: 'text-stone-600' },
  'computer-it': { Icon: Laptop, gradient: 'from-blue-100 to-indigo-50', iconColor: 'text-blue-600' },
  'emergency-helper': { Icon: AlertCircle, gradient: 'from-red-100 to-rose-50', iconColor: 'text-red-600' },
  products: { Icon: Package, gradient: 'from-indigo-100 to-blue-50', iconColor: 'text-indigo-600' },
  'used-products': { Icon: ShoppingBag, gradient: 'from-amber-100 to-orange-50', iconColor: 'text-amber-600' },
};

function CategoryIcon({ slug, size = 'md', className = '' }: { slug: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const foodSlugs = ['cook', 'fast-foods', 'desi-foods', 'biryani', 'chinese', 'bbq', 'sweets'];
  const match = Object.keys(CATEGORY_ICONS).find((k) => slug.includes(k)) || (foodSlugs.some((k) => slug.includes(k)) ? 'cook' : 'mechanic');
  const config = CATEGORY_ICONS[match] ?? CATEGORY_ICONS.mechanic;
  const { Icon, gradient, iconColor } = config;
  const wrapperClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const iconClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  return (
    <div className={`rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner border border-white/60 ${wrapperClass} ${className}`}>
      <Icon className={`${iconClass} ${iconColor}`} />
    </div>
  );
}


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
  'Ask for Help': 'ask-for-help',
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
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [quickFilter2km, setQuickFilter2km] = useState(false);
  const [quickFilterAvailable, setQuickFilterAvailable] = useState(false);
  const [quickFilterTopRated, setQuickFilterTopRated] = useState(false);

  useEffect(() => {
    if (catFromUrl && CATEGORY_TO_FILTER[catFromUrl]) {
      setSidebarFilter(CATEGORY_TO_FILTER[catFromUrl] as SidebarFilter);
    }
  }, [catFromUrl]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const { city } = useCity();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { recent: recentSearches, addSearch } = useRecentSearches();
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [helpRequests, setHelpRequests] = useState<{ id: string; title: string; author_name: string; suggestions_count: number }[]>([]);
  const [donationItems, setDonationItems] = useState<{ id: string; title: string; category_name: string; received: number; amount_requested: number | null }[]>([]);
  const [searchResults, setSearchResults] = useState<FeedItem[] | null>(null);
  const fetchIdRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/favorites')
      .then((r) => r.json())
      .then((d) => {
        const items = (d.items ?? []) as { item_type: string; item_id: string }[];
        setFavorites(new Set(items.map((i) => `${i.item_type}:${i.item_id}`)));
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = async (itemType: string, itemId: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticMedium();
    const key = `${itemType}:${itemId}`;
    const isFav = favorites.has(key);
    try {
      if (isFav) {
        await fetch(`/api/favorites?item_type=${itemType}&item_id=${itemId}`, { method: 'DELETE' });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_type: itemType, item_id: itemId }),
        });
        setFavorites((prev) => new Set([...prev, key]));
      }
    } catch {}
  };

  const startChat = async (authorId: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    hapticLight();
    if (!authorId) return;
    setStartingChat(authorId);
    try {
      const res = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authorId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent('/feed')}`);
        return;
      }
      if (data.thread?.id) {
        router.push(`/chat/${data.thread.id}`);
      }
    } finally {
      setStartingChat(null);
    }
  };

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
    setLoadError(false);
    try {
      const latVal = lat ?? 31.52;
      const lngVal = lng ?? 74.35;
      let url = '';
      if (sidebarFilter === 'all' || sidebarFilter === 'recommended' || sidebarFilter === 'trusted-helpers' || sidebarFilter === 'food-points' || sidebarFilter === 'nearby' || sidebarFilter === 'top-rated' || sidebarFilter === 'verified') {
        if (sidebarFilter === 'all') {
          const radius = quickFilter2km ? 2000 : 100000;
          url = `/api/feed/all-combined?lat=${latVal}&lng=${lngVal}&radius=${radius}`;
          if (city) url += `&city=${encodeURIComponent(city)}`;
        } else if (sidebarFilter === 'recommended') {
          const radius = quickFilter2km ? 2000 : 50000;
          url = `/api/feed/recommended?lat=${latVal}&lng=${lngVal}&radius=${radius}`;
        } else if (sidebarFilter === 'top-rated') {
          url = '/api/feed/top-rated';
        } else {
          const radius = quickFilter2km ? 2000 : (sidebarFilter === 'nearby' ? 5000 : 100000);
          url = `/api/feed/nearby?lat=${latVal}&lng=${lngVal}&radius=${radius}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (id !== fetchIdRef.current) return;
        const newItems = data.items ?? [];
        setItems((prev) => (newItems.length > 0 ? newItems : prev));
        if (sidebarFilter === 'all' || sidebarFilter === 'recommended') {
          fetch('/api/help?limit=5')
            .then((r) => r.json())
            .then((d) => setHelpRequests((d.requests ?? []).map((r: { id: string; title: string; author_name: string; suggestions_count: number }) => ({ id: r.id, title: r.title, author_name: r.author_name, suggestions_count: r.suggestions_count ?? 0 }))))
            .catch(() => setHelpRequests([]));
          fetch('/api/donations?limit=6')
            .then((r) => r.json())
            .then((d) => setDonationItems((d.donations ?? []).map((x: { id: string; title: string; category_name: string; received: number; amount_requested: number | null }) => ({ id: x.id, title: x.title, category_name: x.category_name, received: x.received ?? 0, amount_requested: x.amount_requested }))))
            .catch(() => setDonationItems([]));
        }
      } else if (sidebarFilter === 'sale') {
        const saleUrl = city ? `/api/sale?city=${encodeURIComponent(city)}` : '/api/sale';
        const res = await fetch(saleUrl);
        const data = await res.json();
        if (id !== fetchIdRef.current) return;
        const sales = (data.items ?? []).map((s: Record<string, unknown>) => ({ ...s, item_type: 'sale' }));
        setItems((prev) => (sales.length > 0 ? sales : prev));
      }
    } catch (e) {
      if (id !== fetchIdRef.current) return;
      setLoadError(true);
    } finally {
      if (id === fetchIdRef.current) setLoading(false);
    }
  }, [sidebarFilter, lat, lng, city, quickFilter2km]);

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

  useEffect(() => {
    if (debouncedSearch.trim()) addSearch(debouncedSearch);
  }, [debouncedSearch, addSearch]);

  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}&type=all`)
      .then((r) => r.json())
      .then((d) => setSearchResults(d.results ?? []))
      .catch(() => setSearchResults([]));
  }, [debouncedSearch]);

  const displayItems = searchResults != null && debouncedSearch.trim().length >= 2
    ? searchResults.filter((r) => ['post', 'product', 'sale'].includes(((r as Record<string, unknown>).item_type ?? (r as Record<string, unknown>)._type) as string))
    : items;

  const filteredItems = displayItems.filter((i) => {
    const matchSearch = !debouncedSearch ||
      [i.category_name, i.worker_name, i.area_text, i.reason, i.name, i.title].filter(Boolean).join(' ').toLowerCase().includes(debouncedSearch.toLowerCase());
    const itemType = i.item_type ?? 'post';
    const catSlug = (i.category_name ?? i.category_slug ?? '').toLowerCase().replace(/\s+/g, '-');
    const isFoodPost = FOOD_SLUGS.some((s) => catSlug.includes(s)) || [i.category_name, i.worker_name, i.area_text, i.reason].join(' ').toLowerCase().includes('food');
    const nearbyRadius = quickFilter2km ? 2000 : 5000;

    if (sidebarFilter === 'trusted-helpers') {
      if (itemType !== 'post' || isFoodPost) return false;
    } else if (sidebarFilter === 'food-points') {
      if (itemType !== 'post' || !isFoodPost) return false;
    } else if (sidebarFilter === 'sale') {
      if (itemType !== 'sale') return false;
    } else if (sidebarFilter === 'nearby') {
      if (itemType !== 'post' || (i.distance_m == null || i.distance_m > nearbyRadius)) return false;
    } else if (sidebarFilter === 'top-rated') {
      if (itemType !== 'post' || (i.avg_rating == null || i.avg_rating < 4)) return false;
    } else if (sidebarFilter === 'verified') {
      if (itemType !== 'post' || (i.rec_count == null || i.rec_count === 0)) return false;
    } else if (sidebarFilter === 'recommended') {
      // Recommended shows personalized mix - same as all for display
    }
    if (quickFilterAvailable && itemType === 'post' && i.availability === false) return false;
    if (quickFilterTopRated && itemType === 'post' && (i.avg_rating == null || i.avg_rating < 4)) return false;
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
    const priority = ['Used Products', 'Trusted Helpers', 'Food Points', 'Products'];
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
    <div className="min-h-screen bg-surface-base overflow-x-hidden">
      <FeedHeader onMenuClick={() => setMoreSheetOpen(true)} />

      <div className="flex">
        <FeedSidebar
          activeFilter={sidebarFilter}
          onFilterChange={setSidebarFilter}
          onClose={() => setSidebarOpen(false)}
          open={sidebarOpen}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 py-5 sm:py-8 pb-28 lg:pb-10 overflow-x-hidden">
          <div className="max-w-5xl mx-auto w-full">
            {(isCategoryView || isSubcategoryView) && (
              <Link
                href={isSubcategoryView && categoryFromUrl ? `/feed?c=${categoryFromUrl}` : '/feed'}
                className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 mb-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {isSubcategoryView ? 'Back to category' : 'Back to main feed'}
              </Link>
            )}
            <div className="mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search helpers, food, products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-stone-200/90 shadow-premium focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 outline-none transition-all placeholder:text-stone-400 text-stone-800"
                  aria-label="Search helpers, food, products"
                />
              </div>
              {recentSearches.length > 0 && !search && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs text-stone-500 self-center">Recent:</span>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSearch(s)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition btn-tap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: horizontal category tabs (replaces sidebar) */}
            <div className="lg:hidden mb-4">
              <FeedCategoryTabs
                activeFilter={sidebarFilter}
                onFilterChange={setSidebarFilter}
                onMoreClick={() => setMoreSheetOpen(true)}
              />
            </div>

            {/* Quick filters */}
            {(sidebarFilter === 'all' || sidebarFilter === 'recommended' || sidebarFilter === 'nearby' || sidebarFilter === 'trusted-helpers' || sidebarFilter === 'food-points') && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setQuickFilterAvailable((v) => !v)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition btn-tap ${quickFilterAvailable ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'}`}
                >
                  Available abhi
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilter2km((v) => !v)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition btn-tap ${quickFilter2km ? 'bg-brand-100 text-brand-800 border border-brand-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'}`}
                >
                  2 km range
                </button>
                <button
                  type="button"
                  onClick={() => setQuickFilterTopRated((v) => !v)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition btn-tap ${quickFilterTopRated ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'}`}
                >
                  Top rated
                </button>
              </div>
            )}

            <ProfileCompletionBanner />
            <PushNotificationPrompt />

            {/* Feed */}
            {loading ? (
              <div className="space-y-8">
                <section>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-200 animate-shimmer" />
                    <div className="h-4 w-24 rounded bg-stone-200 animate-shimmer" />
                  </div>
                  <FeedSkeleton count={6} />
                </section>
                <section>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-stone-200 animate-shimmer" />
                    <div className="h-4 w-32 rounded bg-stone-200 animate-shimmer" />
                  </div>
                  <FeedSkeleton count={3} />
                </section>
              </div>
            ) : loadError ? (
              <ErrorState
                title="Could not load feed"
                message="Check your connection and try again."
                onRetry={refetchFeed}
              />
            ) : filteredItems.length === 0 ? (
              <EmptyState
                title="No posts nearby"
                subtitle="Be the first to share a trusted helper!"
                actionLabel="Create"
                actionHref="/post"
              />
            ) : (
              <div className="space-y-8">
                {donationItems.length > 0 && sidebarFilter === 'all' && (
                  <section className="animate-slide-up">
                    <Link href="/donation" className="group/head flex items-center gap-2.5 mb-3">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center shadow-sm border border-stone-100 group-hover/head:border-rose-200">💝</span>
                      <h2 className="text-base font-bold text-stone-800 group-hover/head:text-brand-600">Donations</h2>
                      <span className="text-xs text-stone-400 group-hover/head:text-brand-500 ml-0.5">View all →</span>
                    </Link>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {donationItems.slice(0, 6).map((d) => (
                        <Link key={d.id} href="/donation" className="block">
                          <article className="rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-rose-200">
                            <div className="p-3 flex-1">
                              <h3 className="font-semibold text-stone-900 text-xs line-clamp-2">{d.title}</h3>
                              <p className="text-[10px] text-stone-500 mt-1">{d.category_name}</p>
                              <p className="text-[10px] text-green-600 mt-0.5 font-medium">Rs {d.received.toLocaleString()} received</p>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
                {helpRequests.length > 0 && sidebarFilter === 'all' && (
                  <section className="animate-slide-up">
                    <Link href="/ask-for-help" className="group/head flex items-center gap-2.5 mb-3">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-sm border border-stone-100 group-hover/head:border-amber-200">💡</span>
                      <h2 className="text-base font-bold text-stone-800 group-hover/head:text-brand-600">Ask for Help</h2>
                      <span className="text-xs text-stone-400 group-hover/head:text-brand-500 ml-0.5">View all →</span>
                    </Link>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {helpRequests.slice(0, 6).map((hr) => (
                        <Link key={hr.id} href={`/ask-for-help#${hr.id}`} className="block">
                          <article className="rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-amber-200">
                            <div className="p-3 flex-1">
                              <h3 className="font-semibold text-stone-900 text-xs line-clamp-2">{hr.title}</h3>
                              <p className="text-[10px] text-stone-500 mt-1 truncate">{hr.author_name}</p>
                              <p className="text-[10px] text-brand-600 mt-0.5">{hr.suggestions_count} suggestions</p>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
                {sidebarFilter === 'all' && <YaariFeedSection />}
                {categoryOrder.map((categoryName) => {
                  const categoryItems = grouped[categoryName] ?? [];
                  const showAllInSection = isCategoryView || isSubcategoryView;
                  const displayItems = showAllInSection ? categoryItems : categoryItems.slice(0, FEED_LIMIT_PER_CATEGORY);
                  const hasMore = categoryItems.length > FEED_LIMIT_PER_CATEGORY;
                  const viewAllSlug = CATEGORY_TO_SLUG[categoryName];
                  const catSlug = categoryName.toLowerCase().replace(/\s+/g, '-');

                  const parentSlug = categoryFromUrl ?? getParentCategorySlug(categoryName);
                  const headingHref = viewAllSlug
                    ? (viewAllSlug === 'products' ? '/products' : viewAllSlug === 'used-products' ? '/sale' : `/feed?c=${viewAllSlug}`)
                    : parentSlug
                      ? `/feed?c=${parentSlug}&sub=${catSlug}`
                      : null;

                  return (
                    <section key={categoryName} className="animate-slide-up">
                      <div className="flex items-center justify-between mb-3">
                        {headingHref ? (
                          <Link
                            href={headingHref}
                            className="group/head flex items-center gap-2.5 tracking-tight"
                          >
                            <span className="group-hover/head:shadow-premium-brand transition-all duration-200">
                              <CategoryIcon slug={catSlug} size="sm" className="shadow-premium border border-stone-100 group-hover/head:border-brand-200" />
                            </span>
                            <h2 className="text-base font-bold text-stone-800 group-hover/head:text-brand-600 transition-colors">
                              {categoryName}
                            </h2>
                            <span className="text-xs text-stone-400 group-hover/head:text-brand-500 ml-0.5">View all →</span>
                          </Link>
                        ) : (
                          <h2 className="text-base font-bold text-stone-800 flex items-center gap-2.5 tracking-tight">
                            <CategoryIcon slug={catSlug} size="sm" className="shadow-premium border border-stone-100" />
                            {categoryName}
                          </h2>
                        )}
                        {hasMore && !showAllInSection && headingHref && (
                          <Link href={headingHref} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                            View all
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {displayItems.map((item) => {
                          const itemType = item.item_type ?? 'post';
                          const slug = (item.category_name ?? item.category_slug ?? '').toLowerCase().replace(/\s+/g, '-');
                          const hasImage = !!item.images?.[0];
                          const useCompactCard = categoryName !== 'Used Products';

                          // Product — compact (Ask for Help size) or full
                          if (itemType === 'product') {
                            if (useCompactCard) {
                              return (
                                <div key={item.id} className="relative group">
                                  <Link href={`/products/${item.id}`} className="block">
                                    <article className="rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-stone-200">
                                      <div className="p-3 flex-1 flex items-start gap-2">
                                        <CategoryIcon slug="products" size="sm" className="shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <h3 className="font-semibold text-stone-900 text-xs line-clamp-2">{item.name}</h3>
                                          <p className="text-brand-600 font-bold mt-0.5 text-xs">Rs {item.price_min != null ? item.price_min.toLocaleString() : '0'}+</p>
                                        </div>
                                      </div>
                                    </article>
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFavorite('product', item.id, e)}
                                    className="absolute top-1 right-1 p-1.5 rounded-lg z-10 backdrop-blur shadow-sm bg-white/90 text-stone-600 hover:bg-stone-100"
                                    title="Save"
                                  >
                                    <svg className="w-3.5 h-3.5" fill={favorites.has(`product:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                </div>
                              );
                            }
                            return (
                              <div key={item.id} className="relative group">
                                <Link href={`/products/${item.id}`} className="block touch-feedback touch-feedback-smooth active:scale-[0.99]">
                                  <article className="bg-white rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 border border-stone-100/80 hover:border-stone-200 h-full flex flex-col">
                                    <div className="aspect-[4/3] bg-stone-50 relative overflow-hidden min-h-[72px]">
                                      {(item.images?.length ?? 0) >= 2 ? (
                                        <ImageCarousel
                                          images={item.images!}
                                          alt={item.name ?? ''}
                                          variant="compact"
                                          objectFit="cover"
                                          aspectClass="aspect-[4/3]"
                                          className="group-hover:scale-105 transition-transform duration-200"
                                        />
                                      ) : hasImage ? (
                                        <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                      ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-50">
                                          <CategoryIcon slug="products" size="lg" className="shadow-md" />
                                          <span className="absolute bottom-1 left-1 right-1 text-center text-[10px] font-medium text-stone-500 truncate">{item.category_name}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-2 flex-1 flex flex-col min-h-0">
                                      <h3 className="font-semibold text-stone-900 text-xs line-clamp-1">{item.name}</h3>
                                      <p className="text-brand-600 font-bold mt-0.5 text-xs">Rs {item.price_min != null ? item.price_min.toLocaleString() : '0'}+</p>
                                    </div>
                                  </article>
                                </Link>
                                <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFavorite('product', item.id, e)}
                                    className={`p-1.5 rounded-lg backdrop-blur shadow-sm transition-all touch-feedback touch-feedback-smooth ${favorites.has(`product:${item.id}`) ? 'bg-red-100 text-red-600' : 'bg-white/90 text-stone-600 hover:bg-stone-100'}`}
                                    title="Save"
                                    aria-label={favorites.has(`product:${item.id}`) ? 'Remove from saved' : 'Save'}
                                  >
                                    <svg className="w-3.5 h-3.5" fill={favorites.has(`product:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                  {item.author_id && (
                                    <button
                                      type="button"
                                      onClick={(e) => startChat(item.author_id!, e)}
                                      disabled={startingChat === item.author_id}
                                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur shadow-sm hover:bg-brand-600 hover:text-white text-stone-600 transition-all touch-feedback touch-feedback-smooth"
                                      title="Chat"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // Sale — OLX-style compact
                          if (itemType === 'sale') {
                            return (
                              <div key={item.id} className="relative group">
                                <Link href={`/sale/${item.id}`} className="block">
                                  <article className="bg-white rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 border border-stone-100/80 hover:border-stone-200 h-full flex flex-col">
                                    <div className="aspect-[4/3] bg-stone-50 relative overflow-hidden min-h-[72px]">
                                      {(item.images?.length ?? 0) >= 2 ? (
                                        <ImageCarousel
                                          images={item.images!}
                                          alt={item.title ?? ''}
                                          fallbackIcon="📦"
                                          variant="compact"
                                          objectFit="cover"
                                          aspectClass="aspect-[4/3]"
                                          className="group-hover:scale-105 transition-transform duration-200"
                                        />
                                      ) : hasImage ? (
                                        <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                      ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                                          <CategoryIcon slug="used-products" size="lg" className="shadow-md" />
                                          <span className="absolute bottom-1 left-1 right-1 text-center text-[10px] font-medium text-stone-500 truncate">{item.category_name || 'Used'}</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-2 flex-1 flex flex-col min-h-0">
                                      <h3 className="font-semibold text-stone-900 text-xs line-clamp-1">{item.title}</h3>
                                      <p className="text-brand-600 font-bold mt-0.5 text-xs">Rs {item.price?.toLocaleString()}</p>
                                      {item.area_text && <p className="text-[10px] text-stone-500 mt-0.5 truncate">📍 {item.area_text}</p>}
                                    </div>
                                  </article>
                                </Link>
                                <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFavorite('sale', item.id, e)}
                                    className={`p-1.5 rounded-lg backdrop-blur shadow-sm transition-all ${favorites.has(`sale:${item.id}`) ? 'bg-red-100 text-red-600' : 'bg-white/90 text-stone-600 hover:bg-stone-100'}`}
                                    title="Save"
                                    aria-label={favorites.has(`sale:${item.id}`) ? 'Remove from saved' : 'Save'}
                                  >
                                    <svg className="w-3.5 h-3.5" fill={favorites.has(`sale:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                  {item.author_id && (
                                    <button
                                      type="button"
                                      onClick={(e) => startChat(item.author_id!, e)}
                                      disabled={startingChat === item.author_id}
                                      className="p-1.5 rounded-lg bg-white/90 backdrop-blur shadow-sm hover:bg-brand-600 hover:text-white text-stone-600 transition-all"
                                      title="Chat"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // Post — OLX-style compact box
                          const isEmergency = item.category_name?.toLowerCase().includes('emergency');
                          const isFoodPost = FOOD_SLUGS.some((s) => slug.includes(s)) || [item.category_name, item.worker_name, item.area_text, item.reason].join(' ').toLowerCase().includes('food');

                          // Food Points: compact or full
                          if (isFoodPost) {
                            if (useCompactCard) {
                              return (
                                <div key={item.id} className="relative group">
                                  <Link href={`/post/${item.id}`} className="block">
                                    <article className="rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-stone-200">
                                      <div className="p-3 flex-1 flex items-start gap-2">
                                        <CategoryIcon slug={slug} size="sm" className="shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <h3 className="font-semibold text-stone-900 text-xs line-clamp-2">{item.worker_name || item.category_name}</h3>
                                          {item.area_text && <p className="text-[10px] text-stone-500 mt-0.5 truncate">📍 {item.area_text}</p>}
                                        </div>
                                      </div>
                                    </article>
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={(e) => toggleFavorite('post', item.id, e)}
                                    className="absolute top-1 right-1 p-1.5 rounded-lg z-10 backdrop-blur shadow-sm transition-all bg-white/90 text-stone-600 hover:bg-stone-100"
                                    title="Save"
                                  >
                                    <svg className="w-3.5 h-3.5" fill={favorites.has(`post:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                                </div>
                              );
                            }
                            return (
                              <div key={item.id} className="relative group">
                                <Link href={`/post/${item.id}`} className="block">
                                  <article className="rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-stone-200">
                                    <div className="aspect-[4/3] bg-stone-50 relative overflow-hidden min-h-[72px]">
                                    {(item.images?.length ?? 0) >= 2 ? (
                                      <ImageCarousel
                                        images={item.images!}
                                        alt={item.worker_name || item.category_name || ''}
                                        variant="compact"
                                        objectFit="cover"
                                        aspectClass="aspect-[4/3]"
                                        className="group-hover:scale-105 transition-transform duration-200"
                                      />
                                    ) : hasImage ? (
                                      <>
                                        <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                        <div className="absolute top-1 left-1 flex gap-0.5">
                                          {item.post_type === 'recommendation' ? (
                                            <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-100/95 text-amber-800">👍</span>
                                          ) : (
                                            <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-brand-100/95 text-brand-800">🍽️</span>
                                          )}
                                        </div>
                                        {formatDistance(item.distance_m) && (
                                          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black/40 text-white">{formatDistance(item.distance_m)}</span>
                                        )}
                                      </>
                                    ) : null}
                                    {((item.images?.length ?? 0) >= 2 || hasImage) && (
                                      <div className="absolute top-1 left-1 flex gap-0.5 z-10">
                                        {item.post_type === 'recommendation' ? (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-100/95 text-amber-800">👍</span>
                                        ) : (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-brand-100/95 text-brand-800">🍽️</span>
                                        )}
                                      </div>
                                    )}
                                    {((item.images?.length ?? 0) >= 2 || hasImage) && formatDistance(item.distance_m) && (
                                      <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black/40 text-white z-10">{formatDistance(item.distance_m)}</span>
                                    )}
                                    {!hasImage && (item.images?.length ?? 0) < 2 && (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-100/80 to-violet-50/80">
                                        <CategoryIcon slug={slug} size="lg" className="shadow-md" />
                                        <span className="mt-1.5 text-[10px] font-semibold text-stone-600 truncate max-w-full px-1">{item.category_name}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2 flex-1 flex flex-col min-h-0">
                                    <h3 className="font-semibold text-stone-900 text-xs line-clamp-1">{item.worker_name || item.category_name}</h3>
                                    {item.area_text && (
                                      <p className="text-[11px] text-stone-600 mt-1 flex items-center gap-1">
                                        <span>📍</span>
                                        <span className="line-clamp-2">{item.area_text}</span>
                                      </p>
                                    )}
                                    </div>
                                  </article>
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite('post', item.id, e)}
                                  className="absolute top-1 right-1 p-1.5 rounded-lg z-10 backdrop-blur shadow-sm transition-all bg-white/90 text-stone-600 hover:bg-stone-100"
                                  title="Save"
                                  aria-label={favorites.has(`post:${item.id}`) ? 'Remove from saved' : 'Save'}
                                >
                                  <svg className="w-3.5 h-3.5" fill={favorites.has(`post:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </div>
                            );
                          }

                          // Trusted Helpers: compact or full
                          if (useCompactCard) {
                            return (
                              <div key={item.id} className="relative group">
                                <Link href={`/post/${item.id}`} className="block">
                                  <article className={`rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-stone-200 ${isEmergency ? 'ring-1 ring-red-200' : ''}`}>
                                    <div className="p-3 flex-1 flex items-start gap-2">
                                      <CategoryIcon slug={slug} size="sm" className="shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-stone-900 text-xs line-clamp-2">{item.worker_name || 'Helper'} — {item.category_name}</h3>
                                        {(item.reason || item.relation_tag) && <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{item.reason ?? item.relation_tag}</p>}
                                        <p className="text-[10px] text-brand-600 mt-0.5">❤️ Madad {item.like_count ?? item.madad_count ?? 0}</p>
                                      </div>
                                    </div>
                                  </article>
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite('post', item.id, e)}
                                  className="absolute top-1 right-1 p-1.5 rounded-lg z-10 backdrop-blur shadow-sm transition-all bg-white/90 text-stone-600 hover:bg-stone-100"
                                  title="Save"
                                >
                                  <svg className="w-3.5 h-3.5" fill={favorites.has(`post:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </div>
                            );
                          }
                          return (
                            <article
                              key={item.id}
                              className={`rounded-xl overflow-hidden shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-200 h-full flex flex-col bg-white border border-stone-100/80 hover:border-stone-200 ${
                                isEmergency ? 'ring-1 ring-red-200' : ''
                              }`}
                            >
                              <div className="absolute top-1 right-1 flex gap-0.5 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavorite('post', item.id, e)}
                                  className={`p-1.5 rounded-lg backdrop-blur shadow-sm transition-all ${favorites.has(`post:${item.id}`) ? 'bg-red-100 text-red-600' : 'bg-white/90 text-stone-600 hover:bg-stone-100'}`}
                                  title="Save"
                                  aria-label={favorites.has(`post:${item.id}`) ? 'Remove from saved' : 'Save'}
                                >
                                  <svg className="w-3.5 h-3.5" fill={favorites.has(`post:${item.id}`) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </div>
                              <Link href={`/post/${item.id}`} className="flex-1 flex flex-col block group min-h-0">
                                <div className="aspect-[4/3] bg-stone-50 relative overflow-hidden min-h-[72px]">
                                  {(item.images?.length ?? 0) >= 2 ? (
                                    <>
                                      <ImageCarousel
                                        images={item.images!}
                                        alt={item.worker_name || item.category_name || ''}
                                        variant="compact"
                                        objectFit="cover"
                                        aspectClass="aspect-[4/3]"
                                        className="group-hover:scale-105 transition-transform duration-200"
                                      />
                                      <div className="absolute top-1 left-1 flex gap-0.5 z-10">
                                        {item.post_type === 'recommendation' ? (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-100/95 text-amber-800">👍</span>
                                        ) : (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-brand-100/95 text-brand-800">🔧</span>
                                        )}
                                        {item.avg_rating != null && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-black/40 text-white">⭐{item.avg_rating}</span>}
                                        {(item.rec_count ?? 0) > 0 && (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-blue-500/90 text-white" title="Verified recommendations">✓</span>
                                        )}
                                      </div>
                                      {formatDistance(item.distance_m) && (
                                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black/40 text-white z-10">{formatDistance(item.distance_m)}</span>
                                      )}
                                    </>
                                  ) : hasImage ? (
                                    <>
                                      <img src={item.images![0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
                                      <div className="absolute top-1 left-1 flex gap-0.5">
                                        {item.post_type === 'recommendation' ? (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-100/95 text-amber-800">👍</span>
                                        ) : (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-brand-100/95 text-brand-800">🔧</span>
                                        )}
                                        {item.avg_rating != null && <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-black/40 text-white">⭐{item.avg_rating}</span>}
                                        {(item.rec_count ?? 0) > 0 && (
                                          <span className="px-1 py-0.5 rounded text-[9px] font-semibold bg-blue-500/90 text-white" title="Verified recommendations">✓</span>
                                        )}
                                      </div>
                                      {formatDistance(item.distance_m) && (
                                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black/40 text-white">{formatDistance(item.distance_m)}</span>
                                      )}
                                    </>
                                  ) : (
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${isEmergency ? 'bg-red-50/80' : 'bg-gradient-to-br from-teal-50/80 to-emerald-50/80'}`}>
                                      <CategoryIcon slug={slug} size="lg" className="shadow-md" />
                                      <span className="mt-1.5 text-[10px] font-semibold text-stone-600 truncate max-w-full px-1">{item.category_name}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 flex-1 flex flex-col min-h-0">
                                  <h3 className="font-semibold text-stone-900 text-xs line-clamp-1">{item.worker_name || 'Helper'} — {item.category_name}</h3>
                                  {(item.reason || item.relation_tag) && <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{item.reason ?? item.relation_tag}</p>}
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-semibold">
                                      ❤️ Madad {item.like_count ?? item.madad_count ?? 0}
                                    </span>
                                    {(item.reviews_count ?? 0) > 0 && <span className="text-[9px] text-stone-500">⭐ {item.reviews_count}</span>}
                                  </div>
                                </div>
                              </Link>
                              <div className="px-2 pb-2 pt-0" onClick={(e) => e.stopPropagation()}>
                                <a
                                  href={`tel:${item.phone}`}
                                  className="block w-full min-h-[44px] py-2 rounded-lg bg-brand-600 text-white text-center text-[11px] font-semibold hover:bg-brand-700 transition-all flex items-center justify-center gap-1.5 btn-tap"
                                  aria-label="Call"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                  </svg>
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
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 backdrop-blur-xl border-t border-stone-200/80 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)] flex justify-around py-3 px-2 z-50 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Link href="/feed" className="flex flex-col items-center gap-1 text-brand-600 font-semibold transition">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/post" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">Create</span>
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs">Chat</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs">Profile</span>
        </Link>
      </nav>

      <FeedMoreSheet
        open={moreSheetOpen}
        onClose={() => setMoreSheetOpen(false)}
        onFilterChange={setSidebarFilter}
        activeFilter={sidebarFilter}
      />
      <div className="h-20 lg:hidden" />
    </div>
  );
}

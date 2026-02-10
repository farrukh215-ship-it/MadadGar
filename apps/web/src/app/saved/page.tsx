'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedHeader } from '@/components/FeedHeader';

type FavItem = { id: string; item_type: string; item_id: string; created_at: string };
type PostDetail = { id: string; worker_name: string | null; reason: string | null; category_name: string; images: string[]; phone?: string; author_id?: string };
type ProductDetail = { id: string; name: string; price_min?: number; price_max?: number; images: string[] };
type SaleDetail = { id: string; title: string; price?: number; images: string[] };

const CATEGORY_ICONS: Record<string, string> = {
  mechanic: '🔧', electrician: '⚡', plumber: '🔩', 'ac-technician': '❄️', cook: '👨‍🍳',
  'fast-foods': '🍔', 'desi-foods': '🍛', biryani: '🍚', chinese: '🥡', bbq: '🍖', sweets: '🍰',
  driver: '🚗', cleaner: '🧹', carpenter: '🪚', painter: '🎨', 'mobile-repair': '📱', 'computer-it': '💻', 'emergency-helper': '🚨',
};

export default function SavedPage() {
  const [favorites, setFavorites] = useState<FavItem[]>([]);
  const [details, setDetails] = useState<Record<string, PostDetail | ProductDetail | SaleDetail>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      const items: FavItem[] = data.items ?? [];
      setFavorites(items);

      const key = (t: string, id: string) => `${t}:${id}`;
      const posts = items.filter((i) => i.item_type === 'post').map((i) => i.item_id);
      const products = items.filter((i) => i.item_type === 'product').map((i) => i.item_id);
      const sales = items.filter((i) => i.item_type === 'sale').map((i) => i.item_id);

      const d: Record<string, PostDetail | ProductDetail | SaleDetail> = {};
      if (posts.length) {
        const pr = await fetch(`/api/posts/by-ids?ids=${posts.join(',')}`);
        const pj = await pr.json();
        for (const p of pj.items ?? []) {
          d[key('post', p.id)] = p;
        }
      }
      if (products.length) {
        const pr = await fetch('/api/products');
        const pj = await pr.json();
        for (const p of pj.items ?? []) {
          if (products.includes(p.id)) d[key('product', p.id)] = p;
        }
      }
      if (sales.length) {
        const sr = await fetch('/api/sale');
        const sj = await sr.json();
        for (const s of sj.items ?? []) {
          if (sales.includes(s.id)) d[key('sale', s.id)] = s;
        }
      }
      setDetails(d);
      setLoading(false);
    })();
  }, []);

  const removeFavorite = async (itemType: string, itemId: string) => {
    const res = await fetch(`/api/favorites?item_type=${itemType}&item_id=${itemId}`, { method: 'DELETE' });
    if (res.ok) {
      setFavorites((prev) => prev.filter((f) => !(f.item_type === itemType && f.item_id === itemId)));
    }
  };

  const key = (t: string, id: string) => `${t}:${id}`;

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Saved</h1>
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200">
            <p className="text-stone-500">Abhi tak koi saved item nahi</p>
            <Link href="/feed" className="mt-4 inline-block px-6 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">
              Feed dekho
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((f) => {
              const detail = details[key(f.item_type, f.item_id)];
              if (f.item_type === 'post') {
                const p = detail as PostDetail | undefined;
                const slug = p?.category_name?.toLowerCase().replace(/\s+/g, '-') ?? '';
                return (
                  <article key={f.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                    <div className="p-5 flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-2xl shrink-0">
                        {CATEGORY_ICONS[slug] ?? '🔧'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900">{p?.worker_name ?? 'Post'} — {p?.category_name ?? '—'}</h3>
                        {p?.reason && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{p.reason}</p>}
                        <div className="mt-2 flex items-center gap-2">
                          <Link href={`/post/${f.item_id}`} className="text-sm font-medium text-brand-600 hover:underline">View post →</Link>
                          <button
                            type="button"
                            onClick={() => removeFavorite('post', f.item_id)}
                            className="text-sm text-stone-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      {p?.images?.[0] && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 relative">
                          <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />
                        </div>
                      )}
                    </div>
                  </article>
                );
              }
              if (f.item_type === 'product') {
                const p = detail as ProductDetail | undefined;
                return (
                  <article key={f.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                    <Link href="/products" className="block p-5 flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {p?.images?.[0] ? <Image src={p.images[0]} alt="" width={64} height={64} className="object-cover" unoptimized /> : <span className="text-2xl">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900">{p?.name ?? 'Product'}</h3>
                        <p className="text-sm text-stone-500">Rs {p?.price_min ?? 0} – {p?.price_max ?? '—'}</p>
                      </div>
                    </Link>
                    <div className="px-5 pb-4">
                      <button type="button" onClick={() => removeFavorite('product', f.item_id)} className="text-sm text-stone-500 hover:text-red-600">
                        Remove from saved
                      </button>
                    </div>
                  </article>
                );
              }
              if (f.item_type === 'sale') {
                const s = detail as SaleDetail | undefined;
                return (
                  <article key={f.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                    <Link href="/sale" className="block p-5 flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {s?.images?.[0] ? <Image src={s.images[0]} alt="" width={64} height={64} className="object-cover" unoptimized /> : <span className="text-2xl">💰</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900">{s?.title ?? 'Sale'}</h3>
                        <p className="text-brand-600 font-semibold">Rs {s?.price?.toLocaleString() ?? '—'}</p>
                      </div>
                    </Link>
                    <div className="px-5 pb-4">
                      <button type="button" onClick={() => removeFavorite('sale', f.item_id)} className="text-sm text-stone-500 hover:text-red-600">
                        Remove from saved
                      </button>
                    </div>
                  </article>
                );
              }
              return null;
            })}
          </div>
        )}
      </main>
    </div>
  );
}

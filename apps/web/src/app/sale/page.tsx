'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedHeader } from '@/components/FeedHeader';

const SALE_ICONS: Record<string, string> = {
  mobiles: '📱', laptops: '💻', electronics: '🔌', furniture: '🪑', vehicles: '🚗',
  bikes: '🏍️', clothing: '👕', books: '📚', home: '🏠', sports: '⚽', tools: '🔧', other: '📦',
};

type SaleItem = {
  id: string;
  title: string;
  price: number;
  description?: string;
  images?: string[];
  area_text?: string;
  phone?: string;
  category_name?: string;
  category_slug?: string;
  created_at?: string;
};

export default function SalePage() {
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/categories/sale')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedCategory ? `/api/sale?category=${encodeURIComponent(selectedCategory)}` : '/api/sale';
    fetch(url)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const filteredItems = items.filter(
    (i) =>
      !search ||
      [i.title, i.description, i.area_text, i.category_name].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header - OLX style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Used Products</h1>
          <Link
            href="/sale/add"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20"
          >
            <span className="text-lg">+</span>
            Sell Item
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search in Used Products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-stone-200 shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${!selectedCategory ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === c.slug ? null : c.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${selectedCategory === c.slug ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300'}`}
            >
              <span>{SALE_ICONS[c.slug] ?? '📦'}</span>
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 mb-4">No listings yet</p>
            <Link href="/sale/add" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700">
              <span>+</span> Sell your first item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/sale/${item.id}`}
                className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200/50 transition-all duration-300"
              >
                {/* Image - square, object-cover, premium */}
                <div className="aspect-square bg-stone-100 relative overflow-hidden">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-stone-300">
                      {SALE_ICONS[item.category_slug ?? ''] ?? '📦'}
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                    {item.images && item.images.length > 1 && (
                      <span className="px-2 py-1 rounded-lg bg-black/50 text-white text-xs font-medium">
                        {item.images.length} photos
                      </span>
                    )}
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-stone-900 line-clamp-2 min-h-[2.5rem] group-hover:text-brand-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-xl font-bold text-brand-600 mt-1">Rs {item.price?.toLocaleString()}</p>
                  {item.area_text && (
                    <p className="text-sm text-stone-500 mt-1 flex items-center gap-1">
                      <span>📍</span> {item.area_text}
                    </p>
                  )}
                  {item.created_at && (
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(item.created_at).toLocaleDateString('en-PK')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link href="/feed" className="mt-8 inline-block text-brand-600 font-medium hover:underline">
          ← Back to Feed
        </Link>
      </main>
    </div>
  );
}

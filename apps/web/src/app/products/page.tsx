'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedHeader } from '@/components/FeedHeader';

const PRICE_RANGES = [
  { label: 'Under 5k', min: 0, max: 5000 },
  { label: '5k–10k', min: 5000, max: 10000 },
  { label: '10k–25k', min: 10000, max: 25000 },
  { label: '25k–50k', min: 25000, max: 50000 },
  { label: '50k+', min: 50000, max: 999999999 },
];

const PRODUCT_ICONS: Record<string, string> = {
  'smart-watches': '⌚',
  mobiles: '📱',
  laptops: '💻',
  headphones: '🎧',
  tablets: '📱',
  cameras: '📷',
  tv: '📺',
  gaming: '🎮',
  kitchen: '🍳',
  home: '🏠',
  fashion: '👕',
  footwear: '👟',
  bags: '👜',
  sports: '⚽',
  books: '📚',
};

type Product = {
  id: string;
  name: string;
  price_min?: number;
  price_max?: number;
  description?: string;
  images?: string[];
  link_url?: string;
  category_name?: string;
  category_slug?: string;
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string; icon?: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<{ min: number; max: number } | null>(null);

  useEffect(() => {
    fetch('/api/categories/products')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = '/api/products?';
    if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
    if (selectedPrice) {
      url += `price_min=${selectedPrice.min}&price_max=${selectedPrice.max}`;
    }
    fetch(url)
      .then((r) => r.json())
      .then((d) => setProducts(d.items ?? []))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedPrice]);

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <FeedHeader />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Top Products</h1>
          <Link href="/products/add" className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
            + Add Product
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${!selectedCategory ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === c.slug ? null : c.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${selectedCategory === c.slug ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
            >
              <span>{PRODUCT_ICONS[c.slug] ?? '📦'}</span>
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-stone-500 self-center mr-2">Price:</span>
          {PRICE_RANGES.map((pr) => (
            <button
              key={pr.label}
              type="button"
              onClick={() => setSelectedPrice(selectedPrice?.min === pr.min ? null : pr)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedPrice?.min === pr.min ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}
            >
              {pr.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500">No products in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="block group">
                <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200/50 transition-all duration-300">
                  <div className="aspect-square bg-stone-100 relative overflow-hidden">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl text-stone-300">
                        {PRODUCT_ICONS[p.category_slug ?? ''] ?? '📦'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-stone-500">{p.category_name}</span>
                    <h3 className="font-bold text-stone-900 mt-0.5 line-clamp-2">{p.name}</h3>
                    <p className="text-lg font-bold text-brand-600 mt-2">
                      Rs {p.price_min ?? 0} – {p.price_max ? p.price_max.toLocaleString() : '—'}
                    </p>
                    <p className="text-sm text-brand-600 font-medium mt-2">View product →</p>
                  </div>
                </article>
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

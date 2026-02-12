'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FeedHeader } from '@/components/FeedHeader';

const SALE_ICONS: Record<string, string> = {
  mobiles: '📱', laptops: '💻', electronics: '🔌', furniture: '🪑', vehicles: '🚗',
  bikes: '🏍️', clothing: '👕', books: '📚', home: '🏠', sports: '⚽', tools: '🔧', other: '📦',
  cosmetics: '💄', footwear: '👟', toys: '🧸',
};

const SALE_SUBCATEGORIES: Record<string, string[]> = {
  mobiles: ['iPhone', 'Samsung', 'Xiaomi', 'OnePlus', 'Budget phones'],
  laptops: ['Gaming', 'Office', 'Student', 'MacBook', 'Ultrabook'],
  electronics: ['TV', 'Speakers', 'Headphones', 'Cameras', 'Accessories'],
  furniture: ['Sofas', 'Beds', 'Chairs', 'Tables', 'Wardrobes'],
  vehicles: ['Cars', 'Suzuki', 'Honda', 'Toyota', 'Commercial'],
  bikes: ['125cc', '70cc', 'Sport', 'Scooters', 'Electric'],
  clothing: ['Men', 'Women', 'Kids', 'Shoes', 'Bags'],
  home: ['Kitchen', 'Decor', 'Appliances', 'Storage', 'Lighting'],
  sports: ['Cricket', 'Football', 'Gym', 'Cycling', 'Accessories'],
  books: ['Novels', 'Islamic', 'Academic', 'Kids books', 'Test prep'],
  tools: ['Power tools', 'Hand tools', 'Car tools', 'Construction', 'Gardening'],
  other: ['Bundles', 'Clearance', 'Gadgets', 'Home mix', 'Office items'],
  cosmetics: ['Lipstick', 'Skincare', 'Face Makeup', 'Hair Care', 'Fragrance'],
  footwear: ['Men', 'Women', 'Kids', 'Sports', 'Formal'],
  toys: ['Action Figures', 'Board Games', 'Educational', 'Outdoor', 'Stuffed Toys'],
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
  subcategory_name?: string;
  subcategory_slug?: string;
  created_at?: string;
};

export default function SalePage() {
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [priceBand, setPriceBand] = useState<string>('all');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');

  useEffect(() => {
    fetch('/api/categories/sale')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/categories/sale/subcategories?category=${encodeURIComponent(selectedCategory)}`)
        .then((r) => r.json())
        .then((d) => setSubcategories(d.subcategories ?? []));
    } else {
      setSubcategories([]);
      setSelectedSubcategoryId(null);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    setPriceBand('all');
    let url = selectedCategory ? `/api/sale?category=${encodeURIComponent(selectedCategory)}` : '/api/sale';
    if (selectedSubcategoryId) url += (url.includes('?') ? '&' : '?') + `subcategory_id=${encodeURIComponent(selectedSubcategoryId)}`;
    const pMin = priceMin ? parseFloat(priceMin) : null;
    const pMax = priceMax ? parseFloat(priceMax) : null;
    if (pMin != null && !isNaN(pMin)) url += (url.includes('?') ? '&' : '?') + `price_min=${pMin}`;
    if (pMax != null && !isNaN(pMax)) url += (url.includes('?') ? '&' : '?') + `price_max=${pMax}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSubcategoryId, priceMin, priceMax]);

  const filteredItems = items
    // Text search
    .filter((i) => {
      if (!search) return true;
      const haystack = [i.title, i.description, i.area_text, i.category_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    })
    // Price bands for mobiles category
    .filter((i) => {
      if (selectedCategory !== 'mobiles' || priceBand === 'all') return true;
      const price = i.price ?? 0;
      if (priceBand === 'lt-20000') return price > 0 && price < 20000;
      if (priceBand === '20-50') return price >= 20000 && price <= 50000;
      if (priceBand === '50-100') return price > 50000 && price <= 100000;
      if (priceBand === 'gt-100') return price > 100000;
      return true;
    });

  // Group items by main category so each has its own heading + grid
  const groupedByCategory: Record<string, SaleItem[]> = filteredItems.reduce((acc, item) => {
    const slug = item.category_slug || 'other';
    if (!acc[slug]) acc[slug] = [];
    acc[slug].push(item);
    return acc;
  }, {} as Record<string, SaleItem[]>);

  const orderedCategorySlugs = categories
    .map((c) => c.slug)
    .filter((slug) => groupedByCategory[slug]?.length);

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
            onClick={() => { setSelectedCategory(null); setSelectedSubcategoryId(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${!selectedCategory ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setSelectedCategory(selectedCategory === c.slug ? null : c.slug); setSelectedSubcategoryId(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${selectedCategory === c.slug ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-stone-600 border border-stone-200 hover:border-brand-300'}`}
            >
              <span>{SALE_ICONS[c.slug] ?? '📦'}</span>
              {c.name}
            </button>
          ))}
        </div>

        {/* Subcategory pills (when category is selected) */}
        {selectedCategory && subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-stone-500 self-center py-1">Subcategory:</span>
            <button
              type="button"
              onClick={() => setSelectedSubcategoryId(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${!selectedSubcategoryId ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'}`}
            >
              All
            </button>
            {subcategories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubcategoryId(selectedSubcategoryId === s.id ? null : s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${selectedSubcategoryId === s.id ? 'bg-brand-600 text-white border-brand-600 shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* Price range filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-stone-500">Price range:</span>
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-24 px-3 py-2 rounded-lg border border-stone-200 text-sm"
          />
          <span className="text-stone-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-24 px-3 py-2 rounded-lg border border-stone-200 text-sm"
          />
          <span className="text-xs text-stone-400">(Rs)</span>
        </div>

        {/* Mobiles → price bands (Facebook / OLX style quick filters) */}
        {selectedCategory === 'mobiles' && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'all', label: 'All prices' },
              { id: 'lt-20000', label: 'Under 20k' },
              { id: '20-50', label: '20k – 50k' },
              { id: '50-100', label: '50k – 100k' },
              { id: 'gt-100', label: '100k+' },
            ].map((band) => (
              <button
                key={band.id}
                type="button"
                onClick={() => setPriceBand(band.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  priceBand === band.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-brand-300'
                }`}
              >
                {band.label}
              </button>
            ))}
          </div>
        )}

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
          <div className="space-y-8">
            {orderedCategorySlugs.map((slug) => {
              const sectionItems = groupedByCategory[slug] ?? [];
              const catMeta = categories.find((c) => c.slug === slug);
              if (sectionItems.length === 0) return null;
              const subs = SALE_SUBCATEGORIES[slug] ?? [];
              return (
                <section key={slug}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
                      <span className="text-xl">{SALE_ICONS[slug] ?? '📦'}</span>
                      {catMeta?.name ?? slug}
                    </h2>
                  </div>
                  {subs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {subs.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setSearch(label)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white border border-stone-200 text-stone-600 hover:border-brand-300 hover:text-brand-700 transition"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sectionItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`/sale/${item.id}`}
                        className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-200/50 transition-all duration-300"
                      >
                        <div className="aspect-square bg-stone-100 relative overflow-hidden">
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
                              {SALE_ICONS[item.category_slug ?? ''] ?? '📦'}
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                            {item.images && item.images.length > 1 && (
                              <span className="px-2 py-0.5 rounded-lg bg-black/50 text-white text-[10px] font-medium">
                                {item.images.length} photos
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 min-h-[2.25rem] group-hover:text-brand-600 transition">
                            {item.title}
                          </h3>
                          <p className="text-base font-bold text-brand-600 mt-1">
                            Rs {item.price?.toLocaleString()}
                          </p>
                          {item.area_text && (
                            <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                              <span>📍</span> {item.area_text}
                            </p>
                          )}
                          {item.created_at && (
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              {new Date(item.created_at).toLocaleDateString('en-PK')}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <Link href="/feed" className="mt-8 inline-block text-brand-600 font-medium hover:underline">
          ← Back to Feed
        </Link>
      </main>
    </div>
  );
}

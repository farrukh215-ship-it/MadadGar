'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FeedHeader } from '@/components/FeedHeader';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ShareButton } from '@/components/ShareButton';
import { createClient } from '@/lib/supabase/client';

const PRODUCT_ICONS: Record<string, string> = {
  'smart-watches': '⌚', mobiles: '📱', laptops: '💻', headphones: '🎧', tablets: '📱',
  cameras: '📷', tv: '📺', gaming: '🎮', kitchen: '🍳', home: '🏠', fashion: '👕',
  footwear: '👟', bags: '👜', sports: '⚽', books: '📚',
};

type ProductDetail = {
  id: string;
  author_id?: string;
  name: string;
  price_min?: number;
  price_max?: number;
  description?: string;
  images?: string[];
  link_url?: string;
  category_name?: string;
  category_slug?: string;
  created_at?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<ProductDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setItem(d))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <p className="text-stone-600">Product not found</p>
        <Link href="/products" className="mt-4 text-brand-600 font-medium">← Back to Products</Link>
      </div>
    );
  }

  const images = item.images ?? [];
  const icon = PRODUCT_ICONS[item.category_slug ?? ''] ?? '📦';

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <ImageCarousel
              images={images}
              alt={item.name}
              fallbackIcon={icon}
              variant="full"
              objectFit="contain"
              aspectClass="aspect-square"
              index={carouselIndex}
              onIndexChange={setCarouselIndex}
              onImageClick={(i) => setLightboxIndex(i)}
            />
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-stone-100">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCarouselIndex(i)}
                    className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 ring-2 ring-offset-1 ring-brand-500/50"
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600">
                {icon} {item.category_name ?? 'Product'}
              </span>
              <h1 className="text-2xl font-bold text-stone-900 mt-2">{item.name}</h1>
              <p className="text-2xl font-bold text-brand-600 mt-2">
                Rs {item.price_min?.toLocaleString() ?? '0'} – {item.price_max ? item.price_max.toLocaleString() : '—'}
              </p>
              {item.created_at && (
                <p className="text-xs text-stone-400 mt-1">
                  Added {new Date(item.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>

            {item.description && (
              <div className="bg-white rounded-xl p-4 border border-stone-200">
                <h2 className="font-semibold text-stone-900 mb-2">Description</h2>
                <p className="text-sm text-stone-600 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {item.link_url && (
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-xl bg-brand-600 text-white text-center font-semibold hover:bg-brand-700 transition"
              >
                View Product →
              </a>
            )}

            <div className="flex gap-2 items-center">
              <ShareButton
                title={item.name}
                description={item.description ? (item.description.length > 80 ? item.description.slice(0, 80) + '...' : item.description) : undefined}
                url={`/products/${item.id}`}
                className="flex-1"
                size="md"
                label="Share"
              />
            </div>

            {currentUserId && item.author_id === currentUserId && (
              <Link
                href={`/products/${id}/edit`}
                className="block w-full py-3 rounded-xl border-2 border-brand-300 text-brand-600 text-center font-medium hover:bg-brand-50 transition"
              >
                ✏️ Edit Product
              </Link>
            )}

            <Link href="/sale/add" className="block py-3 rounded-xl border-2 border-dashed border-stone-200 text-stone-600 text-center font-medium hover:bg-stone-50 transition">
              + Sell used item (OLX style)
            </Link>
          </div>
        </div>

        <Link href="/products" className="mt-8 inline-block text-brand-600 font-medium hover:underline">
          ← Back to Products
        </Link>
      </main>

      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 z-10"
          >
            ✕
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-10"
                aria-label="Previous"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <Image
              src={images[lightboxIndex]}
              alt={item.name}
              width={800}
              height={600}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              unoptimized
            />
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % images.length);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-10"
                aria-label="Next"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                  }}
                  className={`w-2 h-2 rounded-full ${i === lightboxIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

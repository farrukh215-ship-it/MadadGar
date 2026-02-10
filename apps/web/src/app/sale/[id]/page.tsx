'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FeedHeader } from '@/components/FeedHeader';

const SALE_ICONS: Record<string, string> = {
  mobiles: '📱', laptops: '💻', electronics: '🔌', furniture: '🪑', vehicles: '🚗',
  bikes: '🏍️', clothing: '👕', books: '📚', home: '🏠', sports: '⚽', tools: '🔧', other: '📦',
};

type SaleDetail = {
  id: string;
  title: string;
  price: number;
  description?: string;
  images?: string[];
  area_text?: string;
  phone?: string;
  category_name?: string;
  category_slug?: string;
  author_name?: string;
  created_at: string;
};

export default function SaleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/sale/${id}`)
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
        <p className="text-stone-600">Listing not found</p>
        <Link href="/sale" className="mt-4 text-brand-600 font-medium">← Back to Used Products</Link>
      </div>
    );
  }

  const images = item.images ?? [];
  const icon = SALE_ICONS[item.category_slug ?? ''] ?? '📦';

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image gallery - OLX style */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="aspect-square bg-stone-100 relative">
              {images[0] ? (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image
                    src={images[0]}
                    alt={item.title}
                    fill
                    className="object-contain cursor-zoom-in"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">{icon}</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto border-t border-stone-100">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 ring-2 ring-offset-1 ring-brand-500/50"
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-600">
                {icon} {item.category_name ?? 'Other'}
              </span>
              <h1 className="text-2xl font-bold text-stone-900 mt-2">{item.title}</h1>
              <p className="text-3xl font-bold text-brand-600 mt-2">Rs {item.price?.toLocaleString()}</p>
              {item.area_text && (
                <p className="text-sm text-stone-500 mt-2 flex items-center gap-1">
                  <span>📍</span> {item.area_text}
                </p>
              )}
              <p className="text-xs text-stone-400 mt-1">
                Posted {new Date(item.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            {item.description && (
              <div className="bg-white rounded-xl p-4 border border-stone-200">
                <h2 className="font-semibold text-stone-900 mb-2">Description</h2>
                <p className="text-sm text-stone-600 whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {item.phone && (
              <div className="flex gap-3">
                <a
                  href={`tel:${item.phone}`}
                  className="flex-1 py-4 rounded-xl bg-brand-600 text-white text-center font-semibold hover:bg-brand-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </a>
                <a
                  href={`https://wa.me/${item.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 rounded-xl bg-emerald-600 text-white text-center font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            )}

            <Link href="/sale/add" className="block py-3 rounded-xl border-2 border-dashed border-brand-300 text-brand-600 text-center font-medium hover:bg-brand-50 transition">
              + Sell your own item
            </Link>
          </div>
        </div>

        <Link href="/sale" className="mt-8 inline-block text-brand-600 font-medium hover:underline">
          ← Back to Used Products
        </Link>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            ✕
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex]}
              alt={item.title}
              width={800}
              height={600}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
              unoptimized
            />
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className={`w-2 h-2 rounded-full ${i === lightboxIndex ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

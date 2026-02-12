'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FeedHeader } from '@/components/FeedHeader';
import { CitySelect } from '@/components/CitySelect';
import { useCity } from '@/contexts/CityContext';

const MAX_IMAGES = 5;
const SALE_ICONS: Record<string, string> = {
  mobiles: '📱', laptops: '💻', electronics: '🔌', furniture: '🪑', vehicles: '🚗',
  bikes: '🏍️', clothing: '👕', books: '📚', home: '🏠', sports: '⚽', tools: '🔧', other: '📦',
  cosmetics: '💄', footwear: '👟', toys: '🧸',
};

export default function AddSalePage() {
  const router = useRouter();
  const { city: contextCity, setCity: setContextCity } = useCity();
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState<string | null>(null);
  const [areaDetail, setAreaDetail] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/categories/sale')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    if (contextCity && !city) {
      setCity(contextCity);
    }
  }, [contextCity, city]);

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const addr = data?.address || {};
          const cityName = addr.city || addr.town || addr.village || addr.state_district || addr.state;
          const area = addr.suburb || addr.neighbourhood || addr.road;
          if (cityName) {
            setCity(cityName);
            setContextCity(cityName);
          }
          if (area) setAreaDetail(area);
        } catch {
          if (contextCity) setCity(contextCity);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        if (contextCity) setCity(contextCity);
        setDetectingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId('');
      return;
    }
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    fetch(`/api/categories/sale/subcategories?category=${encodeURIComponent(cat.slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setSubcategories(d.subcategories ?? []);
        setSubcategoryId('');
      });
  }, [categoryId, categories]);

  const uploadFile = async (file: File) => {
    if (!file || images.length >= MAX_IMAGES) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'post-images');
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setImages((prev) => [...prev, data.url].slice(0, MAX_IMAGES));
      else if (data.error) console.error('Upload error:', data.error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !categoryId || !price) return;
    setLoading(true);
    try {
      const res = await fetch('/api/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          title,
          category_id: categoryId,
          subcategory_id: subcategoryId || null,
          price: parseFloat(price),
          description: description || null,
          area_text: city ? (areaDetail ? `${city}, ${areaDetail}` : city) : (areaDetail || null),
          phone: phone || null,
          images,
        }),
      });
      if (res.ok) {
        router.push('/sale');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-stone-900">Sell Used Product</h1>
          <Link href="/sale" className="text-sm font-medium text-brand-600 hover:underline">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone 13 Pro"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {SALE_ICONS[c.slug] ?? '📦'} {c.name}
                </option>
              ))}
            </select>
          </div>
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Subcategory</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              >
                <option value="">Select subcategory (optional)</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Price (Rs)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              required
            />
          </div>

          {/* Images - premium OLX style */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Photos (max {MAX_IMAGES})</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewIndex(i)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border-2 border-stone-200 hover:border-brand-400 transition group"
                >
                  <Image src={url} alt="" fill className="object-cover" unoptimized sizes="120px" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImages((p) => p.filter((_, j) => j !== i));
                    }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center hover:bg-red-600 opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </button>
              ))}
              {images.length < MAX_IMAGES && (
                <div className="flex flex-col gap-2">
                  <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-2xl text-stone-400 mb-1">📁</span>
                        <span className="text-xs text-stone-500">Gallery</span>
                      </>
                    )}
                  </label>
                  <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="text-2xl text-stone-400 mb-1">📷</span>
                        <span className="text-xs text-stone-500">Camera</span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">Click image to preview • Gallery or Camera to add</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
            <div className="flex gap-2">
              <CitySelect
                value={city}
                onChange={(c) => {
                  setCity(c);
                  if (c) setContextCity(c);
                }}
                placeholder="Select city"
                className="flex-1"
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={detectingLocation}
                className="px-4 py-3 rounded-xl border border-brand-300 bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition shrink-0"
              >
                {detectingLocation ? '...' : '📍 Detect'}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-1">Auto-filled from your last selection. Tap Detect for GPS.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Area (optional)</label>
            <input
              type="text"
              value={areaDetail}
              onChange={(e) => setAreaDetail(e.target.value)}
              placeholder="e.g. DHA Phase 5, Model Town"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 transition shadow-lg shadow-brand-500/20"
          >
            {loading ? 'Posting...' : 'Post for Sale'}
          </button>
        </form>
      </main>

      {/* Image preview lightbox */}
      {previewIndex !== null && images[previewIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewIndex(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            ✕
          </button>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[previewIndex]}
              alt="Preview"
              width={600}
              height={400}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}

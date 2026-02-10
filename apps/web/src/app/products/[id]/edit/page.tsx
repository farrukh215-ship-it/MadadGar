'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FeedHeader } from '@/components/FeedHeader';
import { createClient } from '@/lib/supabase/client';

const MAX_IMAGES = 3;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/products/' + id + '/edit');
        setFetching(false);
        return;
      }
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch('/api/categories/products'),
      ]);
      const prod = await prodRes.json();
      const catData = await catRes.json();
      setCategories(catData.categories ?? []);
      if (prodRes.ok && prod.id) {
        if (prod.author_id !== user.id) {
          setIsOwner(false);
          router.push('/profile');
        } else {
          setIsOwner(true);
          setName(prod.name ?? '');
          setCategoryId(prod.category_id ?? '');
          setPriceMin(prod.price_min != null ? String(prod.price_min) : '');
          setPriceMax(prod.price_max != null ? String(prod.price_max) : '');
          setDescription(prod.description ?? '');
          setLinkUrl(prod.link_url ?? '');
          setImages(prod.images ?? []);
        }
      } else {
        router.push('/profile');
      }
      setFetching(false);
    })();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || images.length >= MAX_IMAGES) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('bucket', 'profile-images');
    const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) setImages((prev) => [...prev, data.url].slice(0, MAX_IMAGES));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category_id: categoryId,
          price_min: priceMin ? parseFloat(priceMin) : null,
          price_max: priceMax ? parseFloat(priceMax) : null,
          description: description || null,
          link_url: linkUrl || null,
          images,
        }),
      });
      if (res.ok) {
        router.push(`/products/${id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <FeedHeader />
      <main className="max-w-xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-stone-900 mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Product name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200"
              required
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price min (Rs)</label>
              <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Price max (Rs)</label>
              <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Images (max {MAX_IMAGES})</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" disabled={images.length >= MAX_IMAGES} />
            {images.length > 0 && (
              <div className="mt-2 flex gap-2">
                {images.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Link URL</label>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-stone-200" rows={3} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-50">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
        <Link href={`/products/${id}`} className="mt-4 inline-block text-brand-600 font-medium hover:underline">← Back to product</Link>
      </main>
    </div>
  );
}

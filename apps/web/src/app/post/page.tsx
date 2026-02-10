'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type PostType = 'recommendation' | 'self' | 'food';

export default function PostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [postType, setPostType] = useState<PostType | null>(null);
  const [preselectCategory, setPreselectCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'food') {
      setPostType('food');
      setPreselectCategory('cook');
      setStep('form');
    }
  }, [searchParams]);

  const handleChoose = (type: PostType, categorySlug?: string) => {
    setPostType(type);
    setPreselectCategory(categorySlug ?? null);
    setStep('form');
  };

  if (step === 'choose') {
    const postOptions = [
      { type: 'food' as const, slug: 'cook', icon: '🍽️', title: 'Food', desc: 'Dhaba, restaurant — trusted food', color: 'from-amber-50 to-orange-50', border: 'border-amber-200', hover: 'hover:from-amber-100 hover:to-orange-100 hover:border-amber-300' },
      { type: 'recommendation' as const, slug: undefined, icon: '👤', title: 'Recommend', desc: 'Mechanic, plumber — trusted helper', color: 'from-stone-50 to-white', border: 'border-stone-200', hover: 'hover:border-brand-300 hover:from-brand-50/30' },
      { type: 'self' as const, slug: undefined, icon: '🔧', title: 'I am a worker', desc: 'Apna skill add karein', color: 'from-stone-50 to-white', border: 'border-stone-200', hover: 'hover:border-brand-300 hover:from-brand-50/30' },
    ];
    const linkOptions = [
      { href: '/products/add', icon: '📦', title: 'Add Product', desc: 'Naya product list karein', color: 'from-slate-50 to-white', border: 'border-slate-200', hover: 'hover:border-brand-300 hover:from-brand-50/30' },
      { href: '/sale/add', icon: '💰', title: 'Post for Sale', desc: 'Used items bechein — OLX style', color: 'from-amber-50/80 to-stone-50', border: 'border-amber-200', hover: 'hover:from-amber-100 hover:to-stone-100 hover:border-amber-300' },
    ];
    const cardClass = (opt: { color: string; border: string; hover: string }) =>
      `rounded-xl border bg-gradient-to-br text-left transition-all duration-200 shadow-3d hover:shadow-3d-hover hover:-translate-y-0.5 active:translate-y-0 ${opt.color} ${opt.border} ${opt.hover}`;
    return (
      <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-brand-50/30 p-4 sm:p-6">
        <Link href="/feed" className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700 text-sm">← Back</Link>
        <h1 className="mt-6 text-xl font-bold text-stone-900">Create</h1>
        <p className="mt-0.5 text-stone-500 text-sm">Post, product ya sale — apni cheez share karein</p>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl">
          {postOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleChoose(opt.type, opt.slug)}
              className={`p-4 sm:p-5 min-h-[100px] sm:min-h-0 ${cardClass(opt)}`}
            >
              <span className="text-2xl sm:text-3xl">{opt.icon}</span>
              <h2 className="mt-2 font-bold text-stone-900 text-sm sm:text-base">{opt.title}</h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 line-clamp-2">{opt.desc}</p>
            </button>
          ))}
          {linkOptions.map((opt) => (
            <Link key={opt.href} href={opt.href} className={`p-4 sm:p-5 min-h-[100px] sm:min-h-0 block ${cardClass(opt)}`}>
              <span className="text-2xl sm:text-3xl">{opt.icon}</span>
              <h2 className="mt-2 font-bold text-stone-900 text-sm sm:text-base">{opt.title}</h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 line-clamp-2">{opt.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  return (
    <PostForm
      postType={postType === 'self' ? 'self' : 'recommendation'}
      preselectCategory={preselectCategory}
      isFood={postType === 'food'}
      onBack={() => setStep('choose')}
      onSuccess={() => router.push('/feed')}
    />
  );
}

const FOOD_CATEGORY_SLUGS = ['cook', 'fast-foods', 'desi-foods', 'biryani', 'chinese', 'bbq', 'sweets'];

function PostForm({
  postType,
  preselectCategory,
  isFood,
  onBack,
  onSuccess,
}: {
  postType: 'recommendation' | 'self';
  preselectCategory: string | null;
  isFood?: boolean;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [phone, setPhone] = useState('');
  const [areaText, setAreaText] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [reason, setReason] = useState('');
  const [intro, setIntro] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  const displayCategories = isFood
    ? categories.filter((c) => FOOD_CATEGORY_SLUGS.includes(c.slug))
    : categories;

  useEffect(() => {
    if (preselectCategory && categories.length > 0 && !categoryId) {
      const cat = categories.find((c) => c.slug === preselectCategory);
      if (cat) setCategoryId(cat.id);
    } else if (isFood && displayCategories.length > 0 && !categoryId) {
      setCategoryId(displayCategories[0].id);
    }
  }, [preselectCategory, categories, categoryId, isFood, displayCategories.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!categoryId) {
        setError('Please select a category');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_type: postType,
          category_id: categoryId,
          phone,
          lat: 31.52,
          lng: 74.35,
          area_text: areaText || undefined,
          worker_name: postType === 'recommendation' ? workerName : undefined,
          reason: postType === 'recommendation' ? reason : undefined,
          intro: postType === 'self' ? intro : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      onSuccess();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-brand-50/30 p-6">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700">← Back</button>
      <h1 className="mt-8 text-2xl font-bold text-stone-900">
        {isFood ? 'Food recommendation' : postType === 'recommendation' ? 'Recommend someone' : 'I am a worker'}
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            {isFood ? 'Food type *' : 'Category *'}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            required
          >
            <option value="">{isFood ? 'Select food type' : 'Select category'}</option>
            {displayCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">Area</label>
          <input
            type="text"
            value={areaText}
            onChange={(e) => setAreaText(e.target.value)}
            placeholder="DHA Phase 5, Lahore"
            className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {postType === 'recommendation' && (
          <>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {isFood ? 'Shop / Restaurant name' : 'Name / Shop name'}
              </label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder={isFood ? 'Karahi Point / Baba Sweets' : 'Rashid / Karahi Point'}
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {isFood ? 'Why recommend?' : 'Why recommend?'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isFood
                    ? 'Best biryani in town / Best karahi'
                    : 'Fixed my tap in 30 mins / Best biryani in town'
                }
                className="w-full min-h-24 px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500"
                required={postType === 'recommendation'}
              />
            </div>
          </>
        )}
        {postType === 'self' && (
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Short intro *</label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="10 years experience"
              className="w-full min-h-24 px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
        )}
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full h-14 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 transition ${
            'bg-brand-600 text-white shadow-brand-500/25 hover:bg-brand-700'
          }`}
        >
          {loading ? 'Posting...' : 'Post recommendation'}
        </button>
      </form>
    </main>
  );
}

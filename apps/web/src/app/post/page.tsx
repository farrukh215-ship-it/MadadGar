'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type PostType = 'recommendation' | 'self' | 'emergency' | 'food';

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
    } else if (type === 'emergency') {
      setPostType('emergency');
      setPreselectCategory('emergency-helper');
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
      { type: 'emergency' as const, slug: 'emergency-helper', icon: '🚨', title: 'Emergency help', desc: 'Urgent madad — plumber, electrician, etc.', color: 'from-red-50 to-orange-50', border: 'border-red-200', hover: 'hover:from-red-100 hover:to-orange-100 hover:border-red-300' },
      { type: 'food' as const, slug: 'cook', icon: '🍽️', title: 'Food recommendation', desc: 'Dhaba, restaurant, tikka — share trusted food', color: 'from-amber-50 to-orange-50', border: 'border-amber-200', hover: 'hover:from-amber-100 hover:to-orange-100 hover:border-amber-300' },
      { type: 'recommendation' as const, slug: undefined, icon: '👤', title: 'Recommend someone', desc: 'Mechanic, plumber, electrician — trusted helper', color: 'from-stone-50 to-white', border: 'border-stone-200', hover: 'hover:border-brand-300 hover:from-brand-50/30' },
      { type: 'self' as const, slug: undefined, icon: '🔧', title: 'I am a skilled worker', desc: 'Apna skill add karein — get discovered', color: 'from-stone-50 to-white', border: 'border-stone-200', hover: 'hover:border-brand-300 hover:from-brand-50/30' },
    ];
    const linkOptions = [
      { href: '/products/add', icon: '📦', title: 'Add Product', desc: 'Naya product list karein — price range ke saath', color: 'from-slate-50 to-white', border: 'border-slate-200', hover: 'hover:border-brand-300 hover:from-brand-50/30' },
      { href: '/sale/add', icon: '💰', title: 'Post for Sale', desc: 'Used items bechein — OLX style listing', color: 'from-amber-50/80 to-stone-50', border: 'border-amber-200', hover: 'hover:from-amber-100 hover:to-stone-100 hover:border-amber-300' },
    ];
    const cardClass = (opt: { color: string; border: string; hover: string }) =>
      `rounded-2xl border bg-gradient-to-br text-left transition-all duration-300 shadow-lg hover:shadow-xl ${opt.color} ${opt.border} ${opt.hover}`;
    return (
      <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-brand-50/30 p-6">
        <Link href="/feed" className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700">← Back</Link>
        <h1 className="mt-8 text-2xl font-bold text-stone-900">Create</h1>
        <p className="mt-1 text-stone-500">Post, product ya sale — apni cheez share karein</p>
        <div className="mt-8 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 scrollbar-hide sm:hidden">
            {postOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleChoose(opt.type, opt.slug)}
                className={`flex-shrink-0 w-64 p-5 ${cardClass(opt)}`}
              >
                <span className="text-3xl">{opt.icon}</span>
                <h2 className="mt-3 font-bold text-stone-900">{opt.title}</h2>
                <p className="mt-2 text-sm text-stone-600">{opt.desc}</p>
              </button>
            ))}
            {linkOptions.map((opt) => (
              <Link key={opt.href} href={opt.href} className={`flex-shrink-0 w-64 p-5 block ${cardClass(opt)}`}>
                <span className="text-3xl">{opt.icon}</span>
                <h2 className="mt-3 font-bold text-stone-900">{opt.title}</h2>
                <p className="mt-2 text-sm text-stone-600">{opt.desc}</p>
              </Link>
            ))}
          </div>
          {postOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleChoose(opt.type, opt.slug)}
              className={`hidden sm:block p-6 ${cardClass(opt)}`}
            >
              <span className="text-4xl">{opt.icon}</span>
              <h2 className="mt-4 font-bold text-stone-900">{opt.title}</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{opt.desc}</p>
            </button>
          ))}
          {linkOptions.map((opt) => (
            <Link key={opt.href} href={opt.href} className={`hidden sm:block p-6 ${cardClass(opt)}`}>
              <span className="text-4xl">{opt.icon}</span>
              <h2 className="mt-4 font-bold text-stone-900">{opt.title}</h2>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{opt.desc}</p>
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
      isEmergency={postType === 'emergency'}
      onBack={() => setStep('choose')}
      onSuccess={() => router.push('/feed')}
    />
  );
}

const FOOD_CATEGORY_SLUGS = ['cook', 'fast-foods', 'desi-foods', 'biryani', 'chinese', 'bbq', 'sweets'];
const EMERGENCY_CATEGORY_SLUGS = ['emergency-helper'];

function PostForm({
  postType,
  preselectCategory,
  isFood,
  isEmergency,
  onBack,
  onSuccess,
}: {
  postType: 'recommendation' | 'self';
  preselectCategory: string | null;
  isFood?: boolean;
  isEmergency?: boolean;
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
    : isEmergency
    ? categories.filter((c) => EMERGENCY_CATEGORY_SLUGS.includes(c.slug))
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
      if (isEmergency && !reason.trim()) {
        setError('Please describe your urgent request');
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
        {isEmergency ? 'Emergency help' : isFood ? 'Food recommendation' : postType === 'recommendation' ? 'Recommend someone' : 'I am a worker'}
      </h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            {isFood ? 'Food type *' : isEmergency ? 'Emergency category *' : 'Category *'}
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
                {isEmergency ? 'Contact / Hospital / Place' : isFood ? 'Shop / Restaurant name' : 'Name / Shop name'}
              </label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                placeholder={isEmergency ? 'Jinnah Hospital / Riaz bhai' : isFood ? 'Karahi Point / Baba Sweets' : 'Rashid / Karahi Point'}
                className="w-full h-12 px-4 rounded-xl border border-stone-200 bg-white shadow-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">
                {isEmergency ? 'Urgent request (required) *' : isFood ? 'Why recommend?' : 'Why recommend?'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isEmergency
                    ? 'Urgently needed O+ Blood / Urgently need Xray machine help Jinnah Hospital / Plumber needed DHA Phase 5'
                    : isFood
                    ? 'Best biryani in town / Best karahi'
                    : 'Fixed my tap in 30 mins / Best biryani in town'
                }
                className={`w-full min-h-24 px-4 py-3 rounded-xl border shadow-sm focus:ring-2 focus:ring-brand-500 ${
                  isEmergency ? 'border-red-200 bg-red-50/50 focus:ring-red-500' : 'border-stone-200 bg-white focus:ring-brand-500'
                }`}
                required={isEmergency}
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
            isEmergency ? 'bg-red-600 text-white shadow-red-500/25 hover:bg-red-700' : 'bg-brand-600 text-white shadow-brand-500/25 hover:bg-brand-700'
          }`}
        >
          {loading ? 'Posting...' : isEmergency ? 'Post emergency request' : 'Post recommendation'}
        </button>
      </form>
    </main>
  );
}

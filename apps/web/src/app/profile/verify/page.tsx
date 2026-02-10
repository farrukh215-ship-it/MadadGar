'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FeedHeader } from '@/components/FeedHeader';

export default function VerifyPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/profile/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-6">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Verified Badge</h1>
          <p className="text-sm text-stone-600 mb-6">
            Apna phone number verify karke ✓ Verified badge payen. Ye badge aapke profile aur posts pe dikhega aur users ko trust badhata hai.
          </p>
          {done ? (
            <div className="text-center py-6">
              <span className="text-4xl">✓</span>
              <p className="mt-4 font-semibold text-emerald-600">Verified successfully!</p>
              <Link href="/profile" className="mt-4 inline-block text-brand-600 font-medium">← Back to Profile</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-50"
              >
                {loading ? '...' : 'Verify'}
              </button>
            </form>
          )}
        </div>
        <Link href="/profile" className="mt-6 inline-block text-stone-500 text-sm">← Back</Link>
      </main>
    </div>
  );
}

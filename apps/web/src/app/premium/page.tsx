'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const PREMIUM_FEATURES = [
  { icon: '∞', title: 'Unlimited Interests', desc: 'Add jitne marzi interests — no 4-item limit' },
  { icon: '★', title: 'Premium Badge', desc: 'Profile pe Premium badge, top visibility in Squad' },
  { icon: '📹', title: '100MB Video Chat', desc: '25MB se upgrade — voice/video messages up to 100MB' },
  { icon: '🗑️', title: 'Delete for Everyone', desc: 'Sent messages delete kar sakte ho sab ke liye' },
  { icon: '📺', title: 'Premium Interest Categories', desc: 'Selected lifestyle & entertainment interests unlock' },
  { icon: '📍', title: 'Priority in Nearby', desc: 'Top pe dikho when others search nearby helpers' },
];

export default function PremiumPage() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetch('/api/premium/status')
      .then((r) => r.json())
      .then((d) => setIsPremium(!!d.is_premium))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-brand-50/30">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="font-semibold text-stone-900">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-stone-900">Madadgar Premium</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 mb-4">
            ★
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Go Premium</h2>
          <p className="text-stone-600 mt-2 max-w-sm mx-auto">
            Unlimited interests, top visibility, bigger messages, aur zyada features
          </p>
          {isPremium && (
            <div className="mt-4 px-4 py-2 rounded-full bg-green-100 text-green-800 font-medium text-sm inline-block">
              ✓ You are Premium
            </div>
          )}
        </div>

        <div className="space-y-3 mb-10">
          {PREMIUM_FEATURES.map((f, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-stone-100 shadow-premium hover:shadow-premium-hover transition">
              <span className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-stone-900">{f.title}</h3>
                <p className="text-sm text-stone-600 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-premium">
          <h3 className="font-bold text-stone-900 mb-3">Kaise purchase karein?</h3>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            Madadgar Premium <strong>in-app purchase</strong> ke through available hoga. App Store (iOS) ya Play Store (Android) se direct subscribe kar sakte ho. Monthly ya yearly plan — apni convenience ke hisaab se.
          </p>
          <p className="text-stone-600 text-sm leading-relaxed">
            Points system: Kuch features ke liye <strong>Madad Points</strong> use kar sakte ho — in-app credits jo recharge kar sakte ho. Jab ready ho to yahan se direct purchase ka option aayega.
          </p>
        </div>

        {!isPremium && (
          <div className="mt-8 text-center">
            <p className="text-stone-500 text-sm mb-4">Premium coming soon — notify karein jab launch ho</p>
            <Link
              href="/profile"
              className="inline-block px-8 py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-premium-brand transition"
            >
              Back to Profile
            </Link>
          </div>
        )}

        <Link href="/profile" className="block mt-8 text-center text-brand-600 font-medium hover:underline">
          ← Back to Profile
        </Link>
      </main>
    </div>
  );
}

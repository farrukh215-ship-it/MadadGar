'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const [nextUrl, setNextUrl] = useState('/feed');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get('error'));
    setNextUrl(params.get('next') ?? '/feed');
  }, []);

  const handleGoogleLogin = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
      },
    });
    if (error) {
      console.error(error);
      return;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Promo section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-10 -left-10 w-64 h-64 bg-brand-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/logo.png" alt="Madadgar" width={36} height={36} />
            <span className="font-bold text-xl text-brand-900">Madadgar</span>
          </Link>
        </div>
        <div className="relative space-y-8">
          <div className="flex flex-wrap gap-2">
            {['Emergency-friendly', 'Trust-first', 'Nearby'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium bg-white/80 text-stone-700 flex items-center gap-1.5 border border-stone-100"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold text-brand-900 leading-tight max-w-lg">
            Madad instantly. Trusted helpers through recommendations.
          </h2>
          <p className="text-stone-600 max-w-md">
            Google se login karein. Recommendations aur &quot;Madad ki ❤️&quot; system se nearby
            trusted helpers ko seconds mein find karein.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '📍', title: 'Nearby Feed', sub: '3-5 km radius' },
              { icon: '⭐', title: 'Top Rated', sub: 'Trust score based' },
              { icon: '📞', title: 'Quick Contact', sub: 'Call/Chat fast' },
              { icon: '✓', title: 'Verified', sub: 'Recommendations' },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="p-4 rounded-xl bg-white/80 border border-stone-100 shadow-sm">
                <span className="text-xl">{icon}</span>
                <p className="mt-1 font-semibold text-brand-900">{title}</p>
                <p className="text-xs text-stone-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative" />
      </div>

      {/* Right: Login panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <Link href="/" className="inline-flex items-center gap-2 lg:hidden mb-6">
              <Image src="/logo.png" alt="Madadgar" width={36} height={36} />
              <span className="font-bold text-xl text-brand-900">Madadgar</span>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-8 sm:p-10">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/logo.png" alt="" width={32} height={32} />
              <span className="font-bold text-lg text-brand-900">Madadgar</span>
            </div>
            <p className="text-sm text-stone-500 mb-6">Trusted helpers, nearby</p>
            <h1 className="text-2xl font-bold text-brand-900 mb-2">Login</h1>
            <p className="text-stone-600 text-sm mb-6">
              Apna Google account se sign in karein — safe aur fast.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              className="w-full h-12 rounded-xl bg-white border-2 border-stone-200 flex items-center justify-center gap-3 hover:bg-stone-50 hover:border-stone-300 transition font-medium text-stone-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-xs text-stone-500 text-center">
              Continue karke aap humari{' '}
              <Link href="/terms" className="text-brand-600 font-medium hover:underline">
                Terms
              </Link>{' '}
              &{' '}
              <Link href="/privacy" className="text-brand-600 font-medium hover:underline">
                Privacy
              </Link>{' '}
              se agree karte hain.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-start gap-3">
              <span className="text-brand-600 flex-shrink-0">📍</span>
              <p className="text-xs text-stone-600">
                Tip: Emergency mein fast access ke liye location permission ON rakhein.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

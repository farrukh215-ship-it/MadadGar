'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useEffect, useState } from 'react';
import { CitySelect } from './CitySelect';
import { useCity } from '@/contexts/CityContext';

export function Header() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const { city, setCity } = useCity();
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200/80 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Logo size="md" />
          <nav className="flex items-center gap-3 sm:gap-6">
            {user && (
              <div className="hidden sm:block w-[140px]">
                <CitySelect value={city} onChange={setCity} placeholder="Select city" className="w-full" />
              </div>
            )}
            <Link href="/help" className="text-sm sm:text-base text-stone-600 hover:text-brand-700 font-medium transition py-2 px-1 -mx-1 touch-feedback touch-feedback-smooth">
              Help
            </Link>
            {user ? (
              <>
                <Link href="/feed" className="text-stone-600 hover:text-brand-700 font-medium transition touch-feedback touch-feedback-smooth">
                  Feed
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition flex items-center gap-2 text-sm sm:text-base shadow-premium-brand touch-feedback touch-feedback-smooth"
                >
                  Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition flex items-center gap-2 text-sm sm:text-base shadow-premium-brand"
              >
                Login
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

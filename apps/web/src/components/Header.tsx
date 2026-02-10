'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { useEffect, useState } from 'react';

export function Header() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => setUser(user ?? null));
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="md" />
          <nav className="flex items-center gap-6">
            <Link href="/help" className="text-stone-600 hover:text-brand-700 font-medium transition">
              Help
            </Link>
            {user ? (
              <>
                <Link href="/feed" className="text-stone-600 hover:text-brand-700 font-medium transition">
                  Feed
                </Link>
                <Link href="/post" className="text-stone-600 hover:text-brand-700 font-medium transition">
                  Create recommendation
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition flex items-center gap-2"
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
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition flex items-center gap-2"
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

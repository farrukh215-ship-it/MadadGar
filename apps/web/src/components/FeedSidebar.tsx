'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type SidebarFilter =
  | 'all'
  | 'trusted-helpers'
  | 'food-points'
  | 'sale'
  | 'nearby'
  | 'top-rated'
  | 'verified';

const SIDEBAR_ITEMS: { id: SidebarFilter; icon: string; label: string; href?: string; badge?: string }[] = [
  { id: 'all', icon: '🌟', label: 'All Madadgar' },
  { id: 'all', icon: '📌', label: 'Saved', href: '/saved' },
  { id: 'all', icon: '❤️', label: 'Interested People', href: '/chat/interests' },
  { id: 'sale', icon: '📦', label: 'Used Products', href: '/sale' },
  { id: 'trusted-helpers', icon: '🔧', label: 'Trusted Helpers' },
  { id: 'food-points', icon: '🍽️', label: 'Food Points' },
  { id: 'nearby', icon: '📍', label: 'Nearby' },
  { id: 'top-rated', icon: '⭐', label: 'Top Rated' },
  { id: 'verified', icon: '✓', label: 'Verified' },
];

export function FeedSidebar({
  activeFilter,
  onFilterChange,
  onClose,
  open,
}: {
  activeFilter: SidebarFilter;
  onFilterChange: (f: SidebarFilter) => void;
  onClose?: () => void;
  open?: boolean;
}) {
  const handleClick = (item: (typeof SIDEBAR_ITEMS)[0]) => {
    if (item.href) {
      return;
    }
    onFilterChange(item.id);
    onClose?.();
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - mobile: slide overlay, desktop: sticky always visible, premium 3D */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          w-64 min-w-[16rem] flex-shrink-0
          bg-white border-r border-stone-200
          transform transition-transform duration-300 ease-out
          lg:sticky lg:top-16 lg:translate-x-0 lg:z-auto lg:self-start lg:max-h-[calc(100vh-4rem)]
          shadow-[4px_0_20px_-5px_rgba(0,0,0,0.08),8px_0_30px_-10px_rgba(0,0,0,0.04)]
          lg:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06),inset_1px_0_0_0_rgba(255,255,255,0.8)]
          lg:rounded-r-2xl lg:border-stone-200/80
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-stone-50/50 lg:rounded-r-2xl overflow-hidden">
          {/* Logo + close (mobile) */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100/80 bg-white/80 backdrop-blur-sm">
            <Link href="/feed" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded drop-shadow-sm" />
              <span className="font-bold text-stone-900">Madadgar</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav items - premium 3D buttons */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = activeFilter === item.id && !item.href;
                const key = item.href ? item.href : `${item.id}-${item.label}`;
                if (item.href) {
                  return (
                    <li key={key}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 font-medium transition-all duration-200 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 touch-feedback touch-feedback-smooth"
                      >
                        <span className="text-xl drop-shadow-sm">{item.icon}</span>
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-600 text-white">{item.badge}</span>
                        )}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => handleClick(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left touch-feedback touch-feedback-smooth ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-50 to-brand-100/80 text-brand-800 shadow-[0_2px_12px_-4px_rgba(20,184,166,0.3),inset_0_1px_0_0_rgba(255,255,255,0.6)] border border-brand-200/60'
                          : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5'
                      }`}
                    >
                      <span className="text-xl drop-shadow-sm">{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}

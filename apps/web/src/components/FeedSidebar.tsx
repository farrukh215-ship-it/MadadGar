'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type SidebarFilter =
  | 'all'
  | 'recommended'
  | 'trusted-helpers'
  | 'food-points'
  | 'sale'
  | 'nearby'
  | 'top-rated'
  | 'verified';

// Squad first, For You last; desktop only; mobile uses tabs + More sheet
const SIDEBAR_ITEMS: { id: SidebarFilter; icon: string; label: string; href?: string; badge?: string }[] = [
  { id: 'all', icon: '💜', label: 'Squad', href: '/chat/interests' },
  { id: 'all', icon: '🌟', label: 'All' },
  { id: 'trusted-helpers', icon: '🔧', label: 'Helpers' },
  { id: 'food-points', icon: '🍽️', label: 'Food' },
  { id: 'sale', icon: '📦', label: 'Products' },
  { id: 'nearby', icon: '📍', label: 'Nearby' },
  { id: 'top-rated', icon: '⭐', label: 'Top Rated' },
  { id: 'verified', icon: '✓', label: 'Verified' },
  { id: 'recommended', icon: '✨', label: 'For You', badge: 'AI' },
  { id: 'all', icon: '📌', label: 'Saved', href: '/saved' },
  { id: 'all', icon: '💡', label: 'Ask for Help', href: '/ask-for-help' },
  { id: 'all', icon: '💝', label: 'Donations', href: '/donation' },
  { id: 'all', icon: '🗺️', label: 'Map', href: '/feed/map' },
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
      {/* Sidebar - desktop only; mobile uses category tabs + More sheet */}
      <aside
        className={`
          hidden lg:block
          w-56 min-w-[14rem] flex-shrink-0
          sticky top-16 self-start max-h-[calc(100vh-4rem)]
          bg-white border-r border-stone-200
          rounded-r-2xl border-stone-200/80
          shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06),inset_1px_0_0_0_rgba(255,255,255,0.8)]
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-stone-50/50 lg:rounded-r-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-4 border-b border-stone-100/80 bg-white/80">
            <Link href="/feed" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded drop-shadow-sm" />
              <span className="font-bold text-stone-900">Madadgar</span>
            </Link>
          </div>

          {/* Nav items - filters + links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {SIDEBAR_ITEMS.map((item, idx) => {
                const isActive = activeFilter === item.id && !item.href;
                const key = item.href ? item.href : `${item.id}-${item.label}`;
                return (
                  <li key={key}>
                    {idx === 9 && <div className="my-3 border-t border-stone-200" aria-hidden />}
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 font-medium transition-all duration-200"
                      >
                        <span className="text-xl">{item.icon}</span>
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClick(item)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left ${
                          isActive
                            ? 'bg-brand-50 text-brand-800 border border-brand-200/60'
                            : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-600 text-white">{item.badge}</span>
                        )}
                      </button>
                    )}
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

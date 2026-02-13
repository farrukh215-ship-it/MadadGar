'use client';

import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import type { SidebarFilter } from './FeedSidebar';

// All first, Yaari below; For You last (find friends who vibe)
const MAIN_TABS: { id: SidebarFilter | 'yaari'; label: string; icon: string | React.ReactNode; href?: string }[] = [
  { id: 'all', label: 'All', icon: <LayoutGrid className="w-4 h-4" strokeWidth={2} /> },
  { id: 'yaari', label: 'Yaari', icon: '💜', href: '/chat/interests' },
  { id: 'trusted-helpers', label: 'Helpers', icon: '🔧' },
  { id: 'food-points', label: 'Food', icon: '🍽️' },
  { id: 'sale', label: 'Products', icon: '📦' },
  { id: 'recommended', label: 'For You', icon: '✨' },
];

const MORE_LINKS: { label: string; href: string; icon: string }[] = [
  { label: 'Yaari', href: '/chat/interests', icon: '💜' },
  { label: 'Saved', href: '/saved', icon: '📌' },
  { label: 'Ask for Help', href: '/ask-for-help', icon: '💡' },
  { label: 'Donations', href: '/donation', icon: '💝' },
  { label: 'Map View', href: '/feed/map', icon: '🗺️' },
];

const MORE_FILTERS: { id: SidebarFilter; label: string; icon: string }[] = [
  { id: 'nearby', label: 'Nearby', icon: '📍' },
  { id: 'top-rated', label: 'Top Rated', icon: '⭐' },
  { id: 'verified', label: 'Verified', icon: '✓' },
];

export function FeedCategoryTabs({
  activeFilter,
  onFilterChange,
  onMoreClick,
}: {
  activeFilter: SidebarFilter;
  onFilterChange: (f: SidebarFilter) => void;
  onMoreClick: () => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-1 scrollbar-hide overscroll-x-contain">
      {MAIN_TABS.map((tab) => {
        const isActive = !tab.href && activeFilter === tab.id;
        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation min-h-[44px] flex items-center bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className={`mr-1.5 flex items-center ${typeof tab.icon === 'string' ? '' : 'text-current'}`}>{tab.icon}</span>
              {tab.label}
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id as SidebarFilter)}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap touch-manipulation min-h-[44px] ${
              isActive
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                : 'bg-white border border-stone-200 text-stone-600 hover:border-brand-200 hover:bg-brand-50'
            }`}
          >
            <span className={`mr-1.5 flex items-center ${typeof tab.icon === 'string' ? '' : 'text-current'}`}>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onMoreClick}
        className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent transition-all duration-200 whitespace-nowrap touch-manipulation min-h-[44px]"
      >
        <span className="mr-1.5">⋯</span>
        More
      </button>
    </div>
  );
}

export function FeedMoreSheet({
  open,
  onClose,
  links = MORE_LINKS,
  filters = MORE_FILTERS,
  onFilterChange,
  activeFilter,
}: {
  open: boolean;
  onClose: () => void;
  links?: { label: string; href: string; icon: string }[];
  filters?: { id: SidebarFilter; label: string; icon: string }[];
  onFilterChange?: (f: SidebarFilter) => void;
  activeFilter?: SidebarFilter;
}) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-[95] lg:hidden bg-white rounded-t-3xl shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] animate-slide-up overflow-hidden"
        style={{ maxHeight: '70vh' }}
        role="dialog"
        aria-label="More options"
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">More</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 transition touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="overflow-y-auto p-3 max-h-[60vh]">
          {filters.length > 0 && onFilterChange && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide px-2 mb-2">Filters</p>
              <ul className="space-y-1">
                {filters.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition touch-manipulation min-h-[52px] text-left ${
                        activeFilter === item.id ? 'bg-brand-50 text-brand-800' : 'text-stone-700 hover:bg-stone-50 active:bg-stone-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide px-2 mb-2">Links</p>
            <ul className="space-y-1">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition touch-manipulation min-h-[52px] font-medium"
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                    <span className="ml-auto text-stone-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}

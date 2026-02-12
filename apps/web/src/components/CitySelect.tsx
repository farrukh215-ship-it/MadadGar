'use client';

import { useState, useRef, useEffect } from 'react';
import { PAKISTAN_CITIES } from '@/lib/cities';

export function CitySelect({
  value,
  onChange,
  placeholder = 'Select city',
  className = '',
  variant = 'default',
}: {
  value: string | null;
  onChange: (city: string | null) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'header';
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? PAKISTAN_CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase().trim()))
    : [...PAKISTAN_CITIES];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHeader = variant === 'header';
  const triggerClass = isHeader
    ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/95 text-xs font-medium backdrop-blur-sm border border-white/10 hover:bg-white/15 transition min-w-0'
    : 'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-stone-200 bg-white text-left text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select city"
      >
        <span className="truncate">📍</span>
        <span className="truncate flex-1 text-left">{value || placeholder}</span>
        <svg className={`w-4 h-4 shrink-0 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-1 w-full max-h-[280px] overflow-hidden bg-white rounded-xl shadow-xl border border-stone-200 animate-slide-up ${
            isHeader ? 'min-w-[200px] right-0' : ''
          }`}
          role="listbox"
        >
          <div className="p-2 border-b border-stone-100 sticky top-0 bg-white">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[220px] py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-stone-500">No city found</p>
            ) : (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  role="option"
                  aria-selected={value === city}
                  onClick={() => {
                    onChange(city);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition ${
                    value === city ? 'bg-brand-50 text-brand-700 font-medium' : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

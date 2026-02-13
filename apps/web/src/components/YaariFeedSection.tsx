'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type YaariUser = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  gender?: string | null;
  shared_count?: number;
  is_active?: boolean;
};

export function YaariFeedSection() {
  const [data, setData] = useState<{ most_active: YaariUser[]; online: YaariUser[] } | null>(null);
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/interests/top-profiles')
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => {
        if (!d) {
          setData(null);
          return;
        }
        const mostActive = (d.most_active ?? []).slice(0, 8);
        const online = mostActive.filter((u: YaariUser) => u.is_active).slice(0, 8);
        setData({ most_active: mostActive, online });
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    const count = (data.most_active.length > 0 ? 1 : 0) + (data.online.length > 0 ? 1 : 0);
    if (count < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % count), 4000);
    return () => clearInterval(t);
  }, [data]);

  if (loading || !data || (data.most_active.length === 0 && data.online.length === 0)) return null;

  const slides: { label: string; icon: string; users: YaariUser[] }[] = [];
  if (data.most_active.length > 0) slides.push({ label: 'Most Active', icon: '🟢', users: data.most_active });
  if (data.online.length > 0) slides.push({ label: 'Online Now', icon: '💬', users: data.online });
  if (slides.length === 0) return null;

  function Avatar({ u }: { u: YaariUser }) {
    return (
      <Link href={`/profile/${u.id}`} className="flex flex-col items-center gap-2 shrink-0 group min-w-[64px]">
        <div className="relative w-14 h-14 rounded-full overflow-visible flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/80 to-stone-200/40 blur-sm scale-110 -z-10" />
          <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-[0_8px_24px_-4px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.12),0_1px_0_rgba(255,255,255,0.8)_inset] group-hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.25),0_6px_16px_-4px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,0.6)_inset] group-hover:ring-violet-300 transition-all duration-200">
            {u.avatar_url ? (
              <Image src={u.avatar_url} alt="" width={56} height={56} className="object-cover w-full h-full" unoptimized />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-200 to-fuchsia-200 flex items-center justify-center text-xl">
                {u.gender === 'female' ? '👩' : u.gender === 'male' ? '👨' : '👤'}
              </div>
            )}
            {u.is_active && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-md" />
            )}
          </div>
        </div>
        <span className="text-[11px] font-medium text-stone-700 truncate max-w-[64px] text-center group-hover:text-brand-600 leading-tight">
          {u.display_name}
        </span>
      </Link>
    );
  }

  return (
    <section className="animate-slide-up mb-8">
      <Link href="/chat/interests" className="group/head flex items-center gap-2.5 mb-3">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg border border-violet-200/50 group-hover/head:shadow-violet-200/50 transition-all">
          💜
        </span>
        <h2 className="text-base font-bold text-stone-800 group-hover/head:text-brand-600">Yaari</h2>
        <span className="text-xs text-stone-400 group-hover/head:text-brand-500 ml-0.5">View all →</span>
      </Link>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-fuchsia-50/50 to-violet-50 border border-violet-200/60 shadow-[0_8px_32px_-8px_rgba(139,92,246,0.2),0_4px_12px_-4px_rgba(139,92,246,0.1)] transition-all duration-300 hover:shadow-[0_12px_40px_-10px_rgba(139,92,246,0.25),0_6px_16px_-6px_rgba(139,92,246,0.12)] hover:-translate-y-0.5">
        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  slide === i ? 'bg-violet-600 w-5' : 'bg-violet-300/70 hover:bg-violet-400'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
        {/* Slides */}
        <div className="relative min-h-[120px] overflow-visible">
          {slides.map((s, i) => (
            <div
              key={s.label}
              className={`absolute inset-0 px-4 pt-3 pb-3 flex flex-col gap-2 justify-start transition-all duration-500 ease-out ${
                slide === i ? 'opacity-100 translate-x-0 z-[1]' : 'opacity-0 translate-x-full pointer-events-none z-0'
              }`}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 shadow-[0_4px_14px_-3px_rgba(0,0,0,0.1),0_2px_6px_-2px_rgba(0,0,0,0.06)] border border-violet-100 w-fit shrink-0">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs font-bold text-violet-800">{s.label}</span>
              </div>
              <div className="flex gap-6 overflow-x-auto scrollbar-hide px-0.5 items-center">
                {s.users.map((u) => (
                  <Avatar key={u.id} u={u} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

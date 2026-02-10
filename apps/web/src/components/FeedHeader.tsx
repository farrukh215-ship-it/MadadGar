'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { NotificationsDropdown } from './NotificationsDropdown';

type UserInfo = {
  id: string;
  avatarUrl: string | null;
  displayName: string | null;
};

export function FeedHeader({
  onMessengerClick,
  onMenuClick,
}: {
  onMessengerClick?: () => void;
  onMenuClick?: () => void;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        setUser(null);
        return;
      }
      const avatar =
        (u.user_metadata as Record<string, string> | undefined)?.avatar_url ??
        (u.user_metadata as Record<string, string> | undefined)?.picture ??
        null;
      const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', u.id).single();
      const displayName = profile?.display_name || (u.email?.split('@')[0] ?? null);
      setUser({ id: u.id, avatarUrl: avatar, displayName: displayName || null });
    })();
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const isLahore = Math.abs(lat - 31.52) < 0.5 && Math.abs(lng - 74.35) < 0.5;
          setLocation(isLahore ? 'Lahore' : 'Nearby');
        },
        () => setLocation('Lahore'),
        { enableHighAccuracy: false, maximumAge: 300000 }
      );
    } else {
      setLocation('Lahore');
    }
  }, []);

  useEffect(() => {
    const heartbeat = () => fetch('/api/presence', { method: 'POST' }).catch(() => {});
    heartbeat();
    const t = setInterval(heartbeat, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.18),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            {onMessengerClick && (
              <button
                type="button"
                onClick={onMessengerClick}
                className="p-2 rounded-lg hover:bg-white/10 transition flex-shrink-0"
                aria-label="Messenger"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.12 7.16L3 22l4.24-1.17A9.7 9.7 0 0012 21.4c5.64 0 10-4.13 10-9.7S17.64 2 12 2zm0 17.4c-1.8 0-3.5-.5-4.9-1.4l-.35-.2-2.54.7.68-2.45-.2-.35A7.9 7.9 0 014 11.7C4 7.24 7.58 4 12 4s8 3.24 8 7.7-3.58 7.7-8 7.7z" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={32} height={32} className="rounded" />
              <span className="font-bold text-lg">Madadgar</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {location && (
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white/95 text-xs font-medium backdrop-blur-sm">
                <span>📍</span>
                {location}
              </span>
            )}
            <Link
              href="/post"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 font-medium transition-all hover:shadow-lg"
            >
              <span>➕</span>
              Create
            </Link>
            <NotificationsDropdown />
            <Link href="/chat" className="p-2 rounded-lg hover:bg-white/10 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-white/10 transition flex-shrink-0 group">
              <div className="relative">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9 ring-2 ring-white/30 group-hover:ring-white/50 transition"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30 group-hover:ring-white/50 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              {user?.displayName && (
                <span className="text-[10px] sm:text-xs font-medium text-white/90 truncate max-w-[80px] sm:max-w-[100px]">
                  {user.displayName}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

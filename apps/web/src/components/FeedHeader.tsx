'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ChatDropdown } from './ChatDropdown';
import { CitySelect } from './CitySelect';
import { useCity } from '@/contexts/CityContext';

type UserInfo = {
  id: string;
  avatarUrl: string | null;
  displayName: string | null;
};

export function FeedHeader({
  onMenuClick,
  chatOpen,
  onChatOpenChange,
  chatButtonRef,
}: {
  onMenuClick?: () => void;
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
  chatButtonRef?: React.RefObject<HTMLButtonElement>;
}) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const { city, setCity } = useCity();
  const internalChatRef = useRef<HTMLButtonElement>(null);
  const chatRef = chatButtonRef ?? internalChatRef;
  const lastToggleRef = useRef(0);
  const isControlled = onChatOpenChange !== undefined;
  const [internalChatOpen, setInternalChatOpen] = useState(false);
  const chatOpenState = isControlled ? (chatOpen ?? false) : internalChatOpen;
  const setChatOpenState = isControlled ? (onChatOpenChange ?? (() => {})) : setInternalChatOpen;

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
    const heartbeat = () => fetch('/api/presence', { method: 'POST' }).catch(() => {});
    heartbeat();
    const t = setInterval(heartbeat, 2 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="rounded-lg p-1 bg-white/10 group-hover:bg-white/20 transition shadow-lg">
                <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded" />
              </div>
              <span className="font-bold text-lg tracking-tight">Madadgar</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <CitySelect
                value={city}
                onChange={setCity}
                placeholder="Select city"
                variant="header"
              />
            </div>
            <NotificationsDropdown />
            <div className="relative flex-shrink-0 z-[45]">
              <button
                ref={chatRef}
                type="button"
                onPointerDown={(e) => {
                  if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                    e.preventDefault();
                    lastToggleRef.current = Date.now();
                    setChatOpenState(!chatOpenState);
                  }
                }}
                onClick={(e) => {
                  if (Date.now() - lastToggleRef.current < 300) return;
                  setChatOpenState(!chatOpenState);
                }}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-white/10 transition group"
                aria-expanded={chatOpenState}
                aria-haspopup="true"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-[10px] sm:text-xs font-medium text-white/90 group-hover:text-white">Chat</span>
              </button>
              <ChatDropdown open={chatOpenState} onClose={() => setChatOpenState(false)} anchorRef={chatRef} />
            </div>
            <Link href="/profile" className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl hover:bg-white/10 transition flex-shrink-0 group">
              <div className="relative ring-2 ring-white/20 group-hover:ring-white/40 rounded-full transition shadow-lg">
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
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

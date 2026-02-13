'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Thread = {
  id: string;
  updated_at: string;
  post_id: string | null;
  title: string;
  unread_count?: number;
  last_message?: string | null;
  other_user?: { id: string; display_name: string; avatar_url?: string | null } | null;
};

export function ChatDropdown({
  open,
  onClose,
  anchorRef,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef<number>(0);
  const [anchorRect, setAnchorRect] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (open) {
      openedAtRef.current = Date.now();
      const rect = anchorRef?.current?.getBoundingClientRect();
      if (rect) setAnchorRect({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
      else setAnchorRect(null);
    } else setAnchorRect(null);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/chat/threads')
      .then((r) => r.json())
      .then((d) => setThreads(d.threads ?? []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Ignore synthetic mousedown from touch (~300ms delay) - prevents immediate close on mobile
      if (Date.now() - openedAtRef.current < 350) return;
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const sectionClass = 'border-b border-stone-100 last:border-b-0';
  const sectionTitleClass = 'text-[10px] font-semibold text-stone-400 uppercase tracking-wide px-3 py-2';
  const linkClass = 'flex items-center gap-3 px-3 py-2.5 hover:bg-stone-50 active:bg-stone-100 transition text-left w-full';

  const content = (
    <>
      {/* Backdrop - mobile only; ignore synthetic click from touch (~300ms) */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 lg:hidden"
        onClick={() => {
          if (Date.now() - openedAtRef.current < 350) return;
          onClose();
        }}
        aria-hidden="true"
      />
      <div
        ref={dropdownRef}
        className="fixed left-4 right-4 top-[72px] bottom-[max(5rem,env(safe-area-inset-bottom))] w-auto lg:w-[min(90vw,320px)] max-h-[calc(100vh-8rem)] lg:max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-stone-200/80 z-[9999] animate-slide-up"
        style={
          typeof window !== 'undefined' && window.innerWidth >= 1024 && anchorRect
            ? { left: 'auto', top: anchorRect.top, right: anchorRect.right, bottom: 'auto' }
            : undefined
        }
        role="dialog"
        aria-label="Chat menu"
      >
        {/* Close button - mobile */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-stone-100 text-stone-500"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/* Squad - first */}
      <div className={`${sectionClass} pt-12 lg:pt-0`}>
        <p className={sectionTitleClass}>💜 Squad</p>
        <Link href="/chat/interests" onClick={onClose} className={linkClass}>
          <span className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-base shrink-0">❤️</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-900 text-sm">Same interests • Chat</p>
            <p className="text-xs text-stone-500">Connect with like-minded people</p>
          </div>
          <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Chats */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>💬 Chats</p>
        {loading ? (
          <div className="px-4 py-6 text-center">
            <div className="inline-block w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <p className="px-4 py-3 text-sm text-stone-500">No chats yet</p>
        ) : (
          <div className="py-1">
            {threads.slice(0, 5).map((t) => (
              <Link
                key={t.id}
                href={`/chat/${t.id}`}
                onClick={onClose}
                className={`${linkClass} group`}
              >
                <div className="relative w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm shrink-0 overflow-hidden">
                  {t.other_user?.avatar_url ? (
                    <Image src={t.other_user.avatar_url} alt="" width={36} height={36} className="object-cover" unoptimized />
                  ) : (
                    <span>💬</span>
                  )}
                  {(t.unread_count ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {t.unread_count! > 99 ? '99+' : t.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">{t.title}</p>
                  <p className="text-xs text-stone-500 truncate">{t.last_message || 'No messages'}</p>
                </div>
                <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            {threads.length > 5 && (
              <Link href="/chat" onClick={onClose} className={`${linkClass} text-brand-600 font-medium`}>
                View all {threads.length} chats →
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Used Items */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>📦 Used Items</p>
        <Link href="/sale" onClick={onClose} className={linkClass}>
          <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-base shrink-0">💰</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-900 text-sm">Browse & chat about items</p>
            <p className="text-xs text-stone-500">Tap any sale item to chat with seller</p>
          </div>
          <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Trusted Helpers */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>🔧 Trusted Helpers</p>
        <Link href="/feed?c=trusted-helpers" onClick={onClose} className={linkClass}>
          <span className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">🔧</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-900 text-sm">Browse helpers</p>
            <p className="text-xs text-stone-500">Mechanic, plumber, electrician...</p>
          </div>
          <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="p-3 border-t border-stone-100">
        <Link
          href="/chat"
          onClick={onClose}
          className="block w-full py-2.5 rounded-xl bg-brand-600 text-white text-center text-sm font-semibold hover:bg-brand-700 transition"
        >
          Open full Chat
        </Link>
      </div>
    </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
}

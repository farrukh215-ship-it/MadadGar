'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Notif = { id: string; type: string; title: string; body?: string; link?: string; read_at: string | null; created_at: string };

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const unread = items.filter((n) => !n.read_at).length;

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="fixed left-4 right-4 top-20 sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:absolute w-auto sm:w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-stone-200 z-50">
            <div className="p-3 border-b border-stone-100">
              <h3 className="font-semibold text-stone-900">Notifications</h3>
            </div>
            <div className="divide-y divide-stone-100">
              {items.length === 0 ? (
                <p className="p-4 text-sm text-stone-500">No notifications</p>
              ) : (
                items.slice(0, 15).map((n) => (
                  <Link
                    key={n.id}
                    href={n.link || '#'}
                    onClick={() => {
                      fetch('/api/notifications', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: n.id, read: true }),
                      });
                      setOpen(false);
                    }}
                    className={`block p-4 hover:bg-stone-50 ${!n.read_at ? 'bg-brand-50/30' : ''}`}
                  >
                    <p className="font-medium text-stone-900 text-sm">{n.title}</p>
                    {n.body && <p className="text-xs text-stone-500 mt-0.5">{n.body}</p>}
                    <p className="text-xs text-stone-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

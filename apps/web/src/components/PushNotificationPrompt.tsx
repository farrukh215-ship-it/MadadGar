'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function PushNotificationPrompt() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'granted' | 'denied' | 'prompt'>('loading');
  const [registering, setRegistering] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    createClient().auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn || typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'granted') setStatus('granted');
    else if (Notification.permission === 'denied') setStatus('denied');
    else setStatus('prompt');
  }, [isLoggedIn]);

  const handleEnable = async () => {
    if (status !== 'prompt') return;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn('VAPID public key not set');
      return;
    }
    setRegistering(true);
    try {
      // Must request permission FIRST – same call stack as user gesture (required on mobile)
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await ('ready' in reg ? (reg as { ready: Promise<unknown> }).ready : Promise.resolve());
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) return;
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, platform: 'web' }),
      });
      setStatus('granted');
    } catch (e) {
      console.error('Push registration failed:', e);
    } finally {
      setRegistering(false);
    }
  };

  if (!isLoggedIn || status !== 'prompt' || dismissed) return null;

  return (
    <div className="mb-4 p-4 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-brand-900">Notifications enable karein</p>
        <p className="text-xs text-brand-700 mt-0.5">Naya chat, reply, madad request — sab pehle se pata chalega</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleEnable}
          disabled={registering}
          className="px-4 py-2.5 min-h-[44px] rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 touch-manipulation cursor-pointer btn-tap"
        >
          {registering ? '...' : 'Enable'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-2 rounded-lg text-brand-600 hover:bg-brand-100"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    out[i] = raw.charCodeAt(i);
  }
  return out;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FeedHeader } from '@/components/FeedHeader';

type SessionInfo = {
  device: string;
  location: string;
  last_active: string;
};

export default function SecurityPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [signingOutHere, setSigningOutHere] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/profile/security');
        return;
      }
      setEmail(user.email ?? null);
      // @ts-expect-error phone may exist in user.user_metadata
      setPhone(user.phone ?? user.user_metadata?.phone ?? null);

      // Local synthetic "session" list – current device + last activity
      const now = new Date();
      const device = typeof navigator !== 'undefined' ? navigator.userAgent : 'Current device';
      const approxLocation = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local timezone';
      setSessions([
        {
          device,
          location: approxLocation,
          last_active: now.toLocaleString('en-PK'),
        },
      ]);
      setLoading(false);
    })();
  }, [router]);

  const signOutHere = async () => {
    setSigningOutHere(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } finally {
      setSigningOutHere(false);
    }
  };

  const signOutAll = async () => {
    setSigningOutAll(true);
    try {
      const supabase = createClient();
      // Supabase JS v2 supports global scope; if not available, this is equivalent to local sign-out.
      // @ts-expect-error global sign-out may not be typed in older client versions
      await supabase.auth.signOut({ scope: 'global' });
      router.push('/login');
    } finally {
      setSigningOutAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <FeedHeader />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Security</h1>
          <Link href="/profile" className="text-sm font-medium text-brand-600 hover:underline">
            ← Back to profile
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Login & identity</h2>
              <p className="text-sm text-stone-600">
                Yeh woh information hai jo aapke account se linked hai. Isay updated rakhein taake aapko login alerts aur recovery easy ho.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Email</span>
                  <span className="font-medium text-stone-900">{email ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Phone</span>
                  <span className="font-medium text-stone-900">{phone ?? '—'}</span>
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Aapka number public feed mein kabhi directly show nahi hota; sirf jab aap khud share karein ya sale listing pe contact dain.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Active sessions</h2>
              <p className="text-sm text-stone-600">
                Facebook ki tarah, yahan se aap dekh saktay hain ke aapka account kin devices pe login hai. Abhi hum current device ke liye details dikhate hain.
              </p>
              <div className="mt-4 space-y-3">
                {sessions.map((s, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm flex flex-col gap-1"
                  >
                    <div className="font-medium text-stone-900 truncate">
                      {s.device}
                    </div>
                    <div className="text-xs text-stone-500">
                      {s.location} • Last active {s.last_active}
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold">
                      Current device
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={signOutHere}
                  disabled={signingOutHere}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-60"
                >
                  {signingOutHere ? 'Signing out…' : 'Log out from this device'}
                </button>
                <button
                  type="button"
                  onClick={signOutAll}
                  disabled={signingOutAll}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-800 text-sm font-semibold hover:bg-stone-200 disabled:opacity-60"
                >
                  {signingOutAll ? 'Logging out…' : 'Log out from all devices'}
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Agar aapko lagta hai ke kisi unknown device se login hua hai to “Log out from all devices” use karein aur password / phone recovery secure rakhein.
              </p>
            </section>

            <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-2">Tips for safe usage</h2>
              <ul className="text-sm text-stone-700 space-y-1.5 list-disc pl-5">
                <li>Apna OTP, CNIC, ya bank details kabhi chat mein share na karein.</li>
                <li>Unknown logon se milne se pehle location aur timing family ko zaroor batain.</li>
                <li>Agar koi user spam / abuse kare to Block aur Report options use karein.</li>
                <li>Public Wi‑Fi pe login ke baad logout zaroor karein.</li>
                <li>Har few months baad Security page khol kar quick review karen.</li>
              </ul>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}


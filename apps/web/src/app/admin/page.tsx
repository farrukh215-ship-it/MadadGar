'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type DonationRequest = {
  id: string;
  title: string;
  description: string | null;
  amount_requested: number | null;
  proof_images: string[];
  verified: boolean;
  created_at: string;
  author_name: string;
  category_name: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [donationRequests, setDonationRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/check')
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(d.is_admin ?? false);
        if (!d.is_admin) {
          setLoading(false);
          return;
        }
        return fetch('/api/admin/donations');
      })
      .then((r) => (r && r.ok ? r.json() : null))
      .then((d) => {
        if (d?.requests) setDonationRequests(d.requests);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  const verifyDonation = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/donations/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        setDonationRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, verified: true } : r))
        );
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-stone-800">Access Denied</h1>
        <p className="text-stone-600 mt-2 text-center">Admin panel access only</p>
        <Link href="/feed" className="mt-6 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700">
          Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Madadgar" width={28} height={28} className="rounded" />
              <span className="font-bold">Admin Panel</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Donation Verification</h2>
          <p className="text-sm text-stone-600 mb-4">
            Verify donation requests (min 5 proof images required). Only verified donations appear in feed.
          </p>

          {donationRequests.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-stone-200">
              <p className="text-stone-500">No donation requests to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donationRequests.map((dr) => (
                <div
                  key={dr.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-900">{dr.title}</h3>
                      <p className="text-sm text-stone-600 mt-1">{dr.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-lg bg-stone-100">{dr.category_name}</span>
                        {dr.amount_requested && (
                          <span className="text-xs px-2 py-1 rounded-lg bg-amber-100 text-amber-800">
                            Rs {dr.amount_requested.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs text-stone-400">{dr.author_name}</span>
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {dr.proof_images?.slice(0, 5).map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                            <img src={url} alt={`Proof ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border" />
                          </a>
                        ))}
                      </div>
                      {(dr.proof_images?.length ?? 0) < 5 && !dr.verified && (
                        <p className="text-xs text-amber-600 mt-2">⚠ Requires 5+ proof images</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {dr.verified ? (
                        <span className="px-3 py-1.5 rounded-xl bg-green-100 text-green-800 text-sm font-medium">✓ Verified</span>
                      ) : (dr.proof_images?.length ?? 0) >= 5 ? (
                        <button
                          type="button"
                          onClick={() => verifyDonation(dr.id)}
                          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
                        >
                          Verify
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="font-semibold text-amber-900">Admin Features</h3>
          <ul className="mt-2 text-sm text-amber-800 space-y-1">
            <li>• Donation verification (5+ proof images)</li>
            <li>• View and moderate content</li>
            <li>• farrukh215@gmail.com has admin access</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

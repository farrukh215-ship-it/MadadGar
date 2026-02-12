'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Donation = {
  id: string;
  title: string;
  description: string | null;
  amount_requested: number | null;
  proof_images: string[];
  category_name: string;
  category_icon: string | null;
  created_at: string;
  author_name: string;
  avatar_url: string | null;
  received: number;
  pending: number;
};

type BankDetails = {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban?: string;
  branch?: string;
};

export default function DonationPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string; icon: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [donateModal, setDonateModal] = useState<{ id: string; title: string; bank?: BankDetails } | null>(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateRef, setDonateRef] = useState('');
  const [donateSubmitting, setDonateSubmitting] = useState(false);

  useEffect(() => {
    const url = selectedCategory ? `/api/donations?category=${selectedCategory}` : '/api/donations';
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setDonations(d.donations ?? []);
        if (d.categories?.length) setCategories(d.categories);
      })
      .catch(() => setDonations([]))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="sticky top-0 z-40 bg-gradient-to-br from-rose-700 via-rose-600 to-rose-800 text-white shadow-lg pt-[env(safe-area-inset-top)]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/feed" className="flex items-center gap-2 shrink-0">
              <Image src="/logo.png" alt="Madadgar" width={26} height={26} className="rounded" />
              <span className="font-bold text-sm sm:text-base hidden sm:inline">Madadgar</span>
            </Link>
            <h1 className="text-base sm:text-lg font-semibold flex-1 text-center">Donations</h1>
            <Link href="/donation/create" className="shrink-0 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium">
              Request
            </Link>
          </div>
          <p className="text-xs text-rose-100 mt-1">Verified donations — direct to needy</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium ${
                !selectedCategory ? 'bg-rose-600 text-white' : 'bg-white border border-stone-200 text-stone-600'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium ${
                  selectedCategory === c.id ? 'bg-rose-600 text-white' : 'bg-white border border-stone-200 text-stone-600'
                }`}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : donations.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
            <div className="text-5xl mb-4">💝</div>
            <p className="font-semibold text-stone-800">No verified donations yet</p>
            <p className="text-sm text-stone-500 mt-1">Verified donations will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((d) => (
              <article
                key={d.id}
                className="bg-white rounded-2xl border border-stone-100 shadow-premium overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden shrink-0">
                      {d.avatar_url ? (
                        <Image src={d.avatar_url} alt="" width={48} height={48} className="object-cover" unoptimized />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-xl">👤</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-medium">
                        {d.category_icon} {d.category_name}
                      </span>
                      <h2 className="text-base font-semibold text-stone-900 mt-1">{d.title}</h2>
                      {d.description && <p className="text-sm text-stone-600 mt-1 line-clamp-2">{d.description}</p>}
                      <p className="text-xs text-stone-400 mt-1">{d.author_name} • {formatDate(d.created_at)}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Received</span>
                      <span className="font-semibold text-green-600">Rs {d.received.toLocaleString()}</span>
                    </div>
                    {d.pending > 0 && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-stone-600">Pending</span>
                        <span className="font-medium text-amber-600">Rs {d.pending.toLocaleString()}</span>
                      </div>
                    )}
                    {d.amount_requested && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-stone-600">Goal</span>
                        <span className="font-medium text-stone-700">Rs {d.amount_requested.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="mt-2 h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all"
                        style={{
                          width: `${d.amount_requested ? Math.min(100, (d.received / d.amount_requested) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {d.proof_images?.slice(0, 5).map((url, i) => (
                      <img key={i} src={url} alt={`Proof ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border shrink-0" />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const res = await fetch(`/api/donations/${d.id}/details`);
                      const data = await res.json();
                      if (res.ok) {
                        setDonateModal({
                          id: d.id,
                          title: d.title,
                          bank: data.bank_account_details,
                        });
                        setDonateAmount('');
                        setDonateRef('');
                      } else if (res.status === 401) {
                        router.push(`/login?next=${encodeURIComponent('/donation')}`);
                      } else {
                        alert(data.error ?? 'Could not load details');
                      }
                    }}
                    className="mt-4 w-full py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
                  >
                    Donate (Direct to account)
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Donate modal - payment flow */}
      {donateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !donateSubmitting && setDonateModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-stone-200">
              <h2 className="text-lg font-bold text-stone-900">Donate</h2>
              <p className="text-sm text-stone-600 mt-1">{donateModal.title}</p>
            </div>
            <div className="p-5 space-y-4">
              {donateModal.bank ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <h3 className="font-semibold text-rose-900 mb-2">Bank details (direct transfer)</h3>
                  <p className="text-sm text-rose-800 font-mono space-y-1">
                    <span className="block">Bank: {donateModal.bank.bank_name}</span>
                    <span className="block">Account: {donateModal.bank.account_title}</span>
                    <span className="block">Number: {donateModal.bank.account_number}</span>
                    {donateModal.bank.iban && <span className="block">IBAN: {donateModal.bank.iban}</span>}
                    {donateModal.bank.branch && <span className="block">Branch: {donateModal.bank.branch}</span>}
                  </p>
                  <p className="text-xs text-rose-700 mt-2 font-normal">
                    Transfer directly to this account. No platform holding — scam-free.
                  </p>
                </div>
              ) : (
                <p className="text-amber-600 text-sm">Bank details not available</p>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Amount (Rs) *</label>
                <input
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  min={1}
                  step={100}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/25 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Transaction/Reference (optional)</label>
                <input
                  type="text"
                  value={donateRef}
                  onChange={(e) => setDonateRef(e.target.value)}
                  placeholder="e.g. JazzCash ref, bank transfer ref"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/25 outline-none"
                />
              </div>
            </div>
            <div className="p-5 pt-0 flex gap-2">
              <button
                type="button"
                onClick={() => setDonateModal(null)}
                disabled={donateSubmitting}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const amount = parseFloat(donateAmount);
                  if (!amount || amount <= 0) {
                    alert('Enter valid amount');
                    return;
                  }
                  setDonateSubmitting(true);
                  try {
                    const res = await fetch(`/api/donations/${donateModal.id}/contribute`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount, payment_reference: donateRef || undefined }),
                    });
                    const data = await res.json();
                    if (res.status === 401) {
                      router.push(`/login?next=${encodeURIComponent('/donation')}`);
                      return;
                    }
                    if (res.ok) {
                      setDonateModal(null);
                      setDonations((prev) =>
                        prev.map((d) =>
                          d.id === donateModal.id
                            ? { ...d, received: d.received + amount }
                            : d
                        )
                      );
                    } else {
                      alert(data.error ?? 'Failed to record');
                    }
                  } catch {
                    alert('Network error');
                  } finally {
                    setDonateSubmitting(false);
                  }
                }}
                disabled={donateSubmitting || !donateAmount || parseFloat(donateAmount) <= 0}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {donateSubmitting ? 'Recording...' : 'I donated'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-stone-200 flex justify-around py-3 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50">
        <Link href="/feed" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          Home
        </Link>
        <Link href="/donation" className="flex flex-col items-center gap-1 text-rose-600 font-semibold">
          <span className="text-2xl">💝</span>
          Donate
        </Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-1 text-stone-500 hover:text-brand-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </Link>
      </nav>
    </div>
  );
}

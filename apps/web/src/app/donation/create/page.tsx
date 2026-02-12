'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const MIN_PROOF_IMAGES = 5;
const MAX_PROOF_IMAGES = 10;

export default function CreateDonationRequestPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountRequested, setAmountRequested] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string; icon: string | null }[]>([]);
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [bankName, setBankName] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [branch, setBranch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/donations')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const uploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || proofImages.length >= MAX_PROOF_IMAGES) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', 'donation-proof');
      const r = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.url) {
        setProofImages((prev) => [...prev, d.url].slice(0, MAX_PROOF_IMAGES));
      } else throw new Error(d.error ?? 'Upload failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeProof = (index: number) => {
    setProofImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (proofImages.length < MIN_PROOF_IMAGES) {
      setError(`Minimum ${MIN_PROOF_IMAGES} proof images required (medical records, bills, etc.)`);
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }
    if (!bankName.trim() || !accountTitle.trim() || !accountNumber.trim()) {
      setError('Bank details are required for direct payments');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          amount_requested: amountRequested ? parseFloat(amountRequested) : undefined,
          category_id: categoryId,
          proof_images: proofImages,
          bank_account_details: {
            bank_name: bankName.trim(),
            account_title: accountTitle.trim(),
            account_number: accountNumber.trim(),
            iban: iban.trim() || undefined,
            branch: branch.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent('/donation/create')}`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit');
        return;
      }
      router.push('/donation?created=1');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="sticky top-0 z-40 bg-gradient-to-br from-rose-700 via-rose-600 to-rose-800 text-white shadow-lg pt-[env(safe-area-inset-top)]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/donation" className="flex items-center gap-2 shrink-0">
              <span className="text-xl">←</span>
              <span className="font-semibold">Back</span>
            </Link>
            <h1 className="text-base sm:text-lg font-semibold flex-1 text-center">Request Donation</h1>
            <div className="w-16" />
          </div>
          <p className="text-xs text-rose-100 mt-1">Submit with 5+ proof images — admin will verify</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <form onSubmit={submit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 outline-none"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Medical treatment for father"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 outline-none"
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your situation..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 outline-none resize-none"
              rows={4}
              maxLength={2000}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Amount needed (Rs)</label>
            <input
              type="number"
              value={amountRequested}
              onChange={(e) => setAmountRequested(e.target.value)}
              placeholder="e.g. 50000"
              min={0}
              step={100}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-rose-500/25 focus:border-rose-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Proof images * (min {MIN_PROOF_IMAGES} — medical, bills, etc.)
            </label>
            <p className="text-xs text-stone-500 mb-2">
              Upload medical reports, bills, or other documents as proof
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {proofImages.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-stone-200">
                  <img src={url} alt={`Proof ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeProof(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              {proofImages.length < MAX_PROOF_IMAGES && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 transition">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={uploadProof}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <span className="text-2xl animate-pulse">⏳</span>
                  ) : (
                    <span className="text-3xl">+</span>
                  )}
                  <span className="text-xs text-stone-500 mt-1">{proofImages.length}/{MIN_PROOF_IMAGES}+</span>
                </label>
              )}
            </div>
            {proofImages.length < MIN_PROOF_IMAGES && (
              <p className="text-amber-600 text-xs mt-1">
                Add {MIN_PROOF_IMAGES - proofImages.length} more image(s)
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Bank account details (for direct payment)</h3>
            <p className="text-xs text-amber-800 mb-3">
              Donations go directly to your account. No platform holding — scam-free.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Bank name *</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. HBL, MCB"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Account title *</label>
                <input
                  type="text"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  placeholder="Account holder name"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Account number *</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">IBAN (optional)</label>
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="PK00BANK0000000000000000"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Branch (optional)</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Branch name"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || proofImages.length < MIN_PROOF_IMAGES}
            className="w-full py-4 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Submitting...' : 'Submit for verification'}
          </button>

          <p className="text-xs text-stone-500 text-center">
            Admin will verify within 24–48 hours. Only verified requests appear in feed.
          </p>
        </form>
      </main>
    </div>
  );
}

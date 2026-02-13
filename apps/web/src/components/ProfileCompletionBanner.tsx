'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CompletionData = {
  percent?: number;
  completion_fields?: { avatar?: boolean; display_name?: boolean; area?: boolean; bio?: boolean };
};

export function ProfileCompletionBanner() {
  const [data, setData] = useState<CompletionData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/profile/complete')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d ?? null))
      .catch(() => setData(null));
  }, []);

  const percent = data?.percent ?? 0;
  const show = percent > 0 && percent < 60 && !dismissed;

  if (!show) return null;

  const tips: string[] = [];
  if (!data?.completion_fields?.avatar) tips.push('photo');
  if (!data?.completion_fields?.area) tips.push('area');
  if (!data?.completion_fields?.display_name) tips.push('name');
  if (!data?.completion_fields?.bio) tips.push('bio');
  const tipText = tips.length > 0 ? ` – add ${tips.slice(0, 2).join('/')}` : '';

  return (
    <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-amber-900">
          Aapka profile {percent}% complete hai{tipText}
        </p>
        <p className="text-xs text-amber-700 mt-0.5">Trust + engagement ke liye profile complete karein</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/profile/edit"
          className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition"
        >
          Complete
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-2 rounded-lg text-amber-600 hover:bg-amber-100 transition"
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

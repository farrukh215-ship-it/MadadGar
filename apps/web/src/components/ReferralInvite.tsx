'use client';

import { useEffect, useState } from 'react';
import { ShareButton } from './ShareButton';

export function ReferralInvite() {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/referrals/code')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setCode(d?.code ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !code) return null;

  const invitePath = `/invite?ref=${code}`;
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${invitePath}` : invitePath;
  const text = `Madadgar – trusted helpers nearby! Friend ko bulao, dono ko benefit. Use my code: ${code}`;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
      <h3 className="font-semibold text-emerald-900 mb-1">Friend ko bulao, dono ko benefit</h3>
      <p className="text-sm text-emerald-700 mb-3">Apna link share karein – WhatsApp, SMS, ya copy</p>
      <div className="flex flex-wrap gap-2">
        <ShareButton
          title="Madadgar – trusted helpers nearby!"
          description={`Use my code: ${code}`}
          url={invitePath}
          size="md"
          label="WhatsApp pe share"
          className="flex-1 min-w-[140px]"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(`${text}\n${fullUrl}`);
          }}
          className="px-4 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition"
        >
          Copy link
        </button>
      </div>
      <p className="text-xs text-emerald-600 mt-2">Code: <strong>{code}</strong></p>
    </div>
  );
}

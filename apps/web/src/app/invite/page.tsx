'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const code = ref?.trim().toUpperCase();
    if (code && typeof window !== 'undefined') {
      localStorage.setItem('madadgar_ref', code);
    }

    createClient().auth.getUser().then(({ data: { user } }) => {
      setChecking(false);
      if (user) {
        router.replace('/feed');
      } else if (code) {
        router.replace(`/login?next=${encodeURIComponent('/feed')}`);
      } else {
        router.replace('/');
      }
    });
  }, [ref, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50">
      <Image src="/logo.png" alt="Madadgar" width={64} height={64} className="mb-4" />
      <h1 className="text-xl font-bold text-stone-900 mb-2">Madadgar</h1>
      <p className="text-stone-600 text-sm mb-6">Trusted helpers, nearby</p>
      {checking ? (
        <div className="inline-block w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      ) : ref ? (
        <p className="text-brand-600 font-medium">Aapke friend ne invite kiya! Redirecting...</p>
      ) : (
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Login →
        </Link>
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <InviteContent />
  );
}

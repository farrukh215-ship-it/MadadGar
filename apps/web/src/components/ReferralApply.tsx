'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ReferralApply() {
  useEffect(() => {
    const ref = typeof window !== 'undefined' ? localStorage.getItem('madadgar_ref') : null;
    if (!ref) return;

    const run = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        await fetch('/api/referrals/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: ref }),
        });
      } finally {
        localStorage.removeItem('madadgar_ref');
      }
    };

    run();
  }, []);

  return null;
}

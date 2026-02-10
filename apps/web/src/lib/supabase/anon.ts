import { createClient } from '@supabase/supabase-js';

/**
 * Anon client for public APIs (feed, etc.) - no session/cookies.
 * Use when auth is not required to avoid session-related 500 errors.
 */
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

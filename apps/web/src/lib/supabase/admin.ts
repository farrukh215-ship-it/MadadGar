import { createClient } from '@supabase/supabase-js';

/**
 * Server-only admin client that bypasses RLS.
 * Use only in API routes after validating the user.
 * Requires SUPABASE_SERVICE_ROLE_KEY in env.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createClient(url, key);
}

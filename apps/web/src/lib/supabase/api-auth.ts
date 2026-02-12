import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase client for API routes that supports both:
 * - Cookie-based auth (web browser)
 * - Authorization: Bearer <token> (mobile apps)
 */
export async function createClientFromRequest(request?: Request) {
  const authHeader = request?.headers?.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (token) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }

  return createServerClient();
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/debug/auth-test
 * Tests auth flow - run after login to verify session works.
 * Returns 200 + user info if session valid, 401 if not.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, status: error.status },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ ok: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

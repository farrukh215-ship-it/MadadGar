import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/feed';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        extra: error as unknown as Record<string, unknown>,
      });
      const userMsg = error.message?.includes('unexpected_failure')
        ? 'Login failed. Check Supabase Dashboard > Logs > Auth for details.'
        : error.message;
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(userMsg)}`
      );
    }
    if (data?.user) {
      try {
        await supabase.rpc('ensure_user_profile', {
          p_user_id: data.user.id,
          p_email: data.user.email ?? data.user.user_metadata?.email ?? null,
          p_display_name:
            data.user.user_metadata?.full_name ??
            data.user.user_metadata?.name ??
            data.user.email?.split('@')[0] ??
            null,
        });
      } catch (e) {
        console.error('[auth/callback] ensure_user_profile failed:', e);
      }
    }
    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[auth/callback] unexpected error:', err);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(msg)}`
    );
  }
}

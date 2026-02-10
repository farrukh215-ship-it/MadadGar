import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/feed', '/post', '/profile', '/chat'];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const { data: { user } } = await supabase.auth.getUser();

    const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (isProtected && !user) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
    }
    if (pathname === '/' && user) {
      return NextResponse.redirect(new URL('/feed', request.url));
    }
  } catch {
    const isProtected = PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (isProtected) {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
    }
  }
  return response;
}

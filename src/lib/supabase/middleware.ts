import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE_OPTIONS } from './cookies';

const PROTECTED = ['/dashboard', '/transactions', '/reports', '/recurring'];
// Signed-in users shouldn't see these — bounce them straight to the app.
const AUTH_PAGES = ['/', '/login', '/signup'];

/**
 * Refreshes the Supabase session on every request and gates the app routes.
 * Signed-out visitors are allowed through only if they're in demo mode
 * (ft_demo cookie); otherwise they're redirected to /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // OAuth/email codes can land on the wrong page (Supabase falls back to the
  // Site URL when a redirect isn't allow-listed). Forward them to the callback
  // so the sign-in completes instead of silently stranding the user.
  {
    const { pathname, searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    if (code && pathname !== '/auth/callback') {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/callback';
      url.search = '';
      url.searchParams.set('code', code);
      url.searchParams.set('redirect', PROTECTED.some((p) => pathname.startsWith(p)) ? pathname : '/dashboard');
      return NextResponse.redirect(url);
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: AUTH_COOKIE_OPTIONS,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const isDemo = request.cookies.get('ft_demo')?.value === '1';

  if (isProtected && !user && !isDemo) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in? The landing/login/signup pages only show logged-out UI,
  // which reads as "the sign-in didn't work" — take them to the app instead.
  if (user && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

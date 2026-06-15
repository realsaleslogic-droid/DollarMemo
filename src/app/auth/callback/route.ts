import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AUTH_COOKIE_OPTIONS } from '@/lib/supabase/cookies';

// OAuth / email-confirmation callback: exchange the code for a session.
//
// Cookie writes are collected and applied to whichever response we return, so
// the (persistent) session is reliably set on success. On FAILURE we sign the
// user out first — otherwise a half-finished sign-in (e.g. picking a different
// Google account that didn't complete) would silently leave the PREVIOUS
// session active, which reads as "logged into the wrong account".
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('redirect') || '/dashboard';

  // The provider can return an error instead of a code (e.g. the user hit
  // "Cancel" on Google's screen).
  if (searchParams.get('error')) {
    const cancelled = searchParams.get('error') === 'access_denied';
    return NextResponse.redirect(`${origin}/login?error=${cancelled ? 'cancelled' : 'auth'}`);
  }

  if (code) {
    const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];
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
            pendingCookies.push(...cookiesToSet);
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Sign-in didn't complete — clear any existing session (local device) so
      // we never leave the user authenticated as a different/previous account.
      await supabase.auth.signOut({ scope: 'local' });
    }

    const res = NextResponse.redirect(error ? `${origin}/login?error=auth` : `${origin}${next}`);
    for (const { name, value, options } of pendingCookies) res.cookies.set(name, value, options);
    return res;
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

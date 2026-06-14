import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { AUTH_COOKIE_OPTIONS } from '@/lib/supabase/cookies';

// OAuth / email-confirmation callback: exchange the code for a session.
//
// We build the redirect response FIRST and have Supabase write the new session
// cookies directly onto it. Using next/headers' cookie store here and then
// returning a fresh NextResponse.redirect can drop those cookies — which is how
// a Google sign-in could "work" once but not persist when you return. Writing
// straight to the response we return guarantees the (persistent) session is set.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('redirect') || '/dashboard';

  // The provider can return an error instead of a code (e.g. the user hit
  // "Cancel" on Google's screen) — send them back with a visible message.
  if (searchParams.get('error')) {
    const cancelled = searchParams.get('error') === 'access_denied';
    return NextResponse.redirect(`${origin}/login?error=${cancelled ? 'cancelled' : 'auth'}`);
  }

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
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
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}

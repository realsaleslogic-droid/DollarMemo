import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// OAuth / email-confirmation callback: exchange the code for a session.
export async function GET(request: Request) {
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
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}

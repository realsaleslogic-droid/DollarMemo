import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email-link confirmation for flows that send a hashed one-time token
// (password recovery, email change, signup confirm). Unlike the PKCE `code`
// flow, verifyOtp works no matter which browser opens the link, so password
// resets succeed even when the email is opened on a phone.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') || '/dashboard';

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Token missing/expired/invalid — send recovery users somewhere useful.
  const fallback = type === 'recovery' ? '/forgot-password' : '/login';
  return NextResponse.redirect(`${origin}${fallback}?error=link_expired`);
}

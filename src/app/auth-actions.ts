'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; message?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function origin() {
  const h = headers();
  return h.get('origin') ?? `https://${h.get('host')}`;
}

/** Create a Supabase Auth account (email + password). */
export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').toLowerCase().trim();
  const password = String(formData.get('password') ?? '');

  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin()}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  // If "Confirm email" is enabled in Supabase, there's no session yet.
  if (!data.session) {
    return { message: 'Check your email to confirm your account, then log in.' };
  }
  redirect('/dashboard');
}

/** Sign in with email + password. */
export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').toLowerCase().trim();
  const password = String(formData.get('password') ?? '');

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Invalid email or password.' };
  redirect('/dashboard');
}

/** Start the Google OAuth flow (requires Google enabled in Supabase Auth). */
export async function loginWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin()}/auth/callback`,
      // Always show Google's account chooser. Without this, Google silently
      // re-approves the last account — pressing the button right after a
      // logout flashes the user straight back in with no choice.
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Send a password-reset email. The link returns the user to /auth/callback,
 * which exchanges the recovery code for a session and forwards to
 * /reset-password where they choose a new password.
 */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').toLowerCase().trim();
  if (!EMAIL_RE.test(email)) return { error: 'Enter a valid email address.' };

  const supabase = createClient();
  // The email template (see AUTH.md / Supabase Auth → Emails) should point at
  // /auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
  // which verifies server-side. redirectTo just needs to be an allowed URL.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin()}/auth/confirm?next=/reset-password`,
  });

  // Always report success so we don't reveal which emails have accounts.
  return {
    message: 'If an account exists for that email, a password reset link is on its way. Check your inbox.',
  };
}

/**
 * Set a new password for the user. Requires the recovery session established by
 * the reset-email link. Updates the password in Supabase Auth.
 */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Your reset link is invalid or has expired. Request a new one.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect('/dashboard');
}

/** Update the signed-in user's display name (stored in auth user_metadata). */
export async function updateProfile(name: string): Promise<{ name: string }> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Please enter a name.');
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.auth.updateUser({ data: { name: trimmed } });
  if (error) throw new Error(error.message);
  return { name: trimmed };
}

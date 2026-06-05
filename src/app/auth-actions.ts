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
    options: { redirectTo: `${origin()}/auth/callback` },
  });
  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/');
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

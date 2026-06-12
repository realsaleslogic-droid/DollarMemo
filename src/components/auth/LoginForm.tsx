'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { login } from '@/app/auth-actions';
import GoogleButton from './GoogleButton';
import DemoButton from '@/components/DemoButton';

const URL_ERRORS: Record<string, string> = {
  cancelled: 'Google sign-in was cancelled. You can try again whenever you like.',
  auth: 'Sign-in didn’t complete. Please try again — if it keeps happening, use email and password.',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Loader2 size={18} className="animate-spin" />}
      Log in
    </button>
  );
}

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [state, action] = useFormState(login, undefined);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Surface auth-callback failures (e.g. /login?error=auth) — read on the
  // client to keep this page statically renderable.
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('error');
    if (key) setUrlError(URL_ERRORS[key] ?? URL_ERRORS.auth);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-soft">Log in to your DollarMemo account.</p>

      {urlError && (
        <p className="mt-4 rounded-xl bg-expense/10 px-3.5 py-2.5 text-sm font-medium text-expense">
          {urlError}
        </p>
      )}

      {googleEnabled && (
        <div className="mt-6 space-y-3">
          <GoogleButton />
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      <form action={action} className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="input" placeholder="••••••••" />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        {state?.error && <p className="text-sm font-medium text-expense">{state.error}</p>}
        {state?.message && <p className="text-sm font-medium text-income">{state.message}</p>}
        <SubmitButton />
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        New here?{' '}
        <Link href="/signup" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
          Create an account
        </Link>
      </p>
      <div className="mt-3 text-center">
        <DemoButton className="text-sm text-ink-soft hover:text-ink">
          or explore the demo →
        </DemoButton>
      </div>
    </div>
  );
}

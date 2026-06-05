'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { requestPasswordReset } from '@/app/auth-actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Loader2 size={18} className="animate-spin" />}
      Send reset link
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, action] = useFormState(requestPasswordReset, undefined);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Forgot your password?</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Enter your account email and we&apos;ll send you a link to reset it.
      </p>

      {state?.message ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl bg-brand-500/10 p-6 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <MailCheck size={20} />
          </span>
          <p className="text-sm font-medium text-ink">{state.message}</p>
          <p className="text-xs text-ink-soft">The link expires after a while — use it soon.</p>
        </div>
      ) : (
        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>
          {state?.error && <p className="text-sm font-medium text-expense">{state.error}</p>}
          <SubmitButton />
        </form>
      )}

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          <ArrowLeft size={15} /> Back to log in
        </Link>
      </div>
    </div>
  );
}

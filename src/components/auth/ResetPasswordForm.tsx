'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { updatePassword } from '@/app/auth-actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Loader2 size={18} className="animate-spin" />}
      Update password
    </button>
  );
}

export default function ResetPasswordForm({ email }: { email: string }) {
  const [state, action] = useFormState(updatePassword, undefined);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Choose a new password</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Set a new password for <span className="font-semibold text-ink">{email}</span>.
      </p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="input"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm new password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="input"
            placeholder="Re-enter your new password"
          />
        </div>
        {state?.error && <p className="text-sm font-medium text-expense">{state.error}</p>}
        <SubmitButton />
      </form>
    </div>
  );
}

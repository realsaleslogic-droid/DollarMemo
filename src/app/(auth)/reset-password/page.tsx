import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Set a new password · DollarMemo' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  // The reset-email link routes through /auth/callback, which establishes a
  // recovery session before forwarding here. No session => link missing/expired.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/15 text-amber-600">
          <AlertTriangle size={20} />
        </span>
        <h1 className="text-xl font-bold">Reset link invalid or expired</h1>
        <p className="max-w-sm text-sm text-ink-soft">
          This password reset link is no longer valid. Request a fresh one and try again.
        </p>
        <Link
          href="/forgot-password"
          className="mt-1 inline-flex rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm email={user.email ?? ''} />;
}

'use client';

import { Landmark, Loader2 } from 'lucide-react';
import { useConnectBank } from './useConnectBank';
import { BankTrustLine } from '@/components/BankTrust';
import { cn } from '@/lib/utils';

/**
 * Opens Stripe Financial Connections to link a bank/card, then syncs and
 * refreshes so the new transactions appear everywhere.
 *
 * `withSecurityNote` adds the small "Secured by Stripe" line under the button
 * (used on the Accounts page) — left off in the dashboard header so it doesn't
 * change the header's height.
 */
export default function ConnectBankButton({
  className,
  onLinked,
  withSecurityNote = false,
}: {
  className?: string;
  onLinked?: () => void;
  withSecurityNote?: boolean;
}) {
  const { connect, busy, importing, error } = useConnectBank(onLinked);

  return (
    <div className={cn('inline-flex flex-col items-start', withSecurityNote ? 'gap-1.5' : 'gap-1')}>
      <button
        onClick={connect}
        disabled={busy || importing}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60',
          className
        )}
      >
        {busy || importing ? <Loader2 size={17} className="animate-spin" /> : <Landmark size={17} />}
        {busy ? 'Connecting…' : importing ? 'Importing…' : 'Connect bank'}
      </button>
      {importing && (
        <p className="max-w-xs text-xs text-ink-soft">
          Bank connected — importing your transactions now. They&apos;ll appear automatically.
        </p>
      )}
      {error && <p className="max-w-xs text-xs text-expense">{error}</p>}
      {withSecurityNote && !importing && !error && <BankTrustLine />}
    </div>
  );
}

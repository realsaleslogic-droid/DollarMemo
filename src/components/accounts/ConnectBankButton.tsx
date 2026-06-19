'use client';

import { Landmark, Loader2 } from 'lucide-react';
import { useConnectBank } from './useConnectBank';
import { cn } from '@/lib/utils';

/**
 * Opens Stripe Financial Connections to link a bank/card, then syncs and
 * refreshes so the new transactions appear everywhere.
 *
 * `block` makes the button full-width on mobile (and auto-width from sm up) so
 * it lays out cleanly in the Accounts card; left off (default) in the compact
 * dashboard header where it should hug its content.
 */
export default function ConnectBankButton({
  className,
  onLinked,
  block = false,
}: {
  className?: string;
  onLinked?: () => void;
  block?: boolean;
}) {
  const { connect, busy, importing, error } = useConnectBank(onLinked);

  return (
    <div
      className={cn(
        'flex-col gap-1',
        block ? 'flex w-full sm:inline-flex sm:w-auto' : 'inline-flex items-start'
      )}
    >
      <button
        onClick={connect}
        disabled={busy || importing}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60',
          block && 'w-full sm:w-auto',
          className
        )}
      >
        {busy || importing ? <Loader2 size={17} className="animate-spin" /> : <Landmark size={17} />}
        {busy ? 'Connecting…' : importing ? 'Importing…' : 'Connect bank'}
      </button>
      {importing && (
        <p className="text-xs text-ink-soft">
          Bank connected — importing your transactions now. They&apos;ll appear automatically.
        </p>
      )}
      {error && <p className="text-xs text-expense">{error}</p>}
    </div>
  );
}

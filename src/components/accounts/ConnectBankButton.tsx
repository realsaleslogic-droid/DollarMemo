'use client';

import { Landmark, Loader2 } from 'lucide-react';
import { useConnectBank } from './useConnectBank';
import { cn } from '@/lib/utils';

/**
 * Opens Stripe Financial Connections to link a bank/card, then syncs and
 * refreshes so the new transactions appear everywhere.
 */
export default function ConnectBankButton({
  className,
  onLinked,
}: {
  className?: string;
  onLinked?: () => void;
}) {
  const { connect, busy, error } = useConnectBank(onLinked);

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={connect}
        disabled={busy}
        className={cn(
          'group inline-flex items-center gap-2.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60',
          className
        )}
      >
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/20">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Landmark size={13} />}
        </span>
        <span className="whitespace-nowrap leading-none">
          {busy ? 'Connecting…' : 'Connect bank'}
        </span>
      </button>
      {error && <p className="max-w-xs text-xs text-expense">{error}</p>}
    </div>
  );
}

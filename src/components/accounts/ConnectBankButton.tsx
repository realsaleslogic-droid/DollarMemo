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
  const { connect, busy, importing, error } = useConnectBank(onLinked);

  return (
    <div className="inline-flex flex-col items-start gap-1">
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
    </div>
  );
}

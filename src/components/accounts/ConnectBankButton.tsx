'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Landmark, Loader2 } from 'lucide-react';
import { createFcSession, linkAccounts } from '@/app/stripe-actions';
import { cn } from '@/lib/utils';

// Load Stripe.js once. Publishable key is public-safe.
const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

/**
 * Opens Stripe Financial Connections to link a bank/card. On success it stores
 * the linked accounts (server-side), runs the first sync, and refreshes so the
 * new transactions appear everywhere.
 */
export default function ConnectBankButton({
  className,
  onLinked,
}: {
  className?: string;
  onLinked?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setError(null);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load.');

      const { clientSecret } = await createFcSession();
      const result = await stripe.collectFinancialConnectionsAccounts({ clientSecret });
      if (result.error) throw new Error(result.error.message ?? 'Connection was cancelled.');

      const ids = (result.financialConnectionsSession?.accounts ?? []).map((a) => a.id);
      if (ids.length) {
        await linkAccounts(ids);
        onLinked?.();
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect your bank.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={busy}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60',
          className
        )}
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Landmark size={17} />}
        {busy ? 'Connecting…' : 'Connect bank'}
      </button>
      {error && <p className="max-w-xs text-xs text-expense">{error}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { createFcSession, linkAccounts } from '@/app/stripe-actions';

// Load Stripe.js once. Publishable key is public-safe.
const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

/**
 * Shared Stripe Financial Connections flow: create a session, open the modal,
 * persist the linked accounts, sync, and refresh. Used by the connect button
 * and the dashboard bank control.
 */
export function useConnectBank(onLinked?: () => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
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

  return { connect, busy, error };
}

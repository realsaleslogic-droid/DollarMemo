'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { createFcSession, linkAccounts, syncTransactions } from '@/app/stripe-actions';

// Load Stripe.js once. Publishable key is public-safe.
const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PK ? loadStripe(PK) : null;

// First-import polling: Stripe ingests a newly-linked account's transactions
// asynchronously, so the sync right after linking usually finds nothing yet.
// We re-sync on a short cadence until rows arrive (or we give up quietly).
const POLL_ATTEMPTS = 12;
const POLL_DELAY_MS = 6000;

/**
 * Shared Stripe Financial Connections flow: create a session, open the modal,
 * persist the linked accounts, sync, and refresh. The first import is polled
 * automatically until transactions land — no manual "Sync now" needed.
 * Used by the connect button and the dashboard bank control.
 */
export function useConnectBank(onLinked?: () => void) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  async function pollFirstImport(baseline: number) {
    setImporting(true);
    try {
      for (let i = 0; i < POLL_ATTEMPTS; i++) {
        await new Promise((r) => setTimeout(r, POLL_DELAY_MS));
        if (!alive.current) return;
        const res = await syncTransactions();
        if (res.added > baseline) {
          onLinked?.();
          router.refresh();
          return;
        }
      }
    } catch {
      /* best-effort — the user can still sync manually */
    } finally {
      if (alive.current) setImporting(false);
    }
  }

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
        const res = await linkAccounts(ids);
        onLinked?.();
        router.refresh();
        // Keep syncing in the background until the new account's history
        // lands (res.added counts existing accounts too, so poll until the
        // total grows past this baseline).
        void pollFirstImport(res.added);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to connect your bank.');
    } finally {
      setBusy(false);
    }
  }

  return { connect, busy, importing, error };
}

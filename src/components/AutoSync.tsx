'use client';

import { useEffect } from 'react';
import { autoSyncTransactions } from '@/app/stripe-actions';
import { useFinanceStore } from '@/store/useFinanceStore';

// Rendered only for signed-in users. Pulls new bank transactions automatically
// — on app open and on an interval — so the user never has to press "Sync now".
// The server action itself only hits Stripe when the data is actually stale.
const INTERVAL_MS = 10 * 60 * 1000; // re-check every 10 minutes while open

export default function AutoSync() {
  const merge = useFinanceStore((s) => s.mergeServerTransactions);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const res = await autoSyncTransactions();
        if (!cancelled && res.transactions?.length) merge(res.transactions);
      } catch {
        /* background best-effort — manual "Sync now" remains available */
      }
    };

    run();
    // Also re-run when the tab is refocused (the user came back to the app).
    const onFocus = () => run();
    window.addEventListener('focus', onFocus);
    const id = setInterval(run, INTERVAL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      clearInterval(id);
    };
  }, [merge]);

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';

/**
 * Returns transactions plus a `ready` flag that is only true after the
 * component has mounted on the client AND the store has been hydrated. Pages
 * use `ready` to show polished skeletons during the brief load, and to avoid
 * server/client hydration mismatches.
 */
export function useReady() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const transactions = useFinanceStore((s) => s.transactions);
  const hydrated = useFinanceStore((s) => s.hydrated);
  return { transactions, ready: mounted && hydrated };
}

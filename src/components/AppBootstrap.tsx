'use client';

import { useRef } from 'react';
import { useFinanceStore, loadDemoData, type DataMode } from '@/store/useFinanceStore';
import { useSessionStore, type SessionUser } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { generateSampleTransactions } from '@/lib/sampleData';
import type { Transaction } from '@/lib/types';

/**
 * Runs once on mount to put the app into the right mode:
 *  - db:   hydrate the store with the user's server-loaded transactions.
 *  - demo: hydrate from localStorage, or seed fresh sample data on first visit.
 */
export default function AppBootstrap({
  mode,
  user,
  transactions,
}: {
  mode: DataMode;
  user: SessionUser | null;
  transactions: Transaction[];
}) {
  const done = useRef(false);
  if (!done.current) {
    done.current = true;
    useSettingsStore.getState().hydrateSettings();
    if (mode === 'db') {
      useFinanceStore.getState().hydrate(transactions, 'db');
    } else {
      const data = loadDemoData() ?? generateSampleTransactions();
      useFinanceStore.getState().hydrate(data, 'demo');
    }
    useSessionStore.getState().set({ user, mode });
  }
  return null;
}

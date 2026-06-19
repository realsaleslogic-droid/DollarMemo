'use client';

import { create } from 'zustand';
import type { Transaction, TransactionInput, Period, Granularity } from '@/lib/types';
import { createTransaction, updateTransaction, deleteTransaction, fetchTransactionsBefore } from '@/app/actions';
import { INITIAL_TRANSACTION_LOAD, TRANSACTION_PAGE_SIZE } from '@/lib/pagination';

export type DataMode = 'db' | 'demo';

const DEMO_KEY = 'flowtrack-demo-data-v1';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function toRecord(input: TransactionInput, id = uid(), recurringId?: string | null): Transaction {
  const magnitude = Math.abs(Number(input.amount) || 0);
  const isRecurring = !!input.isRecurring;
  return {
    id,
    date: new Date(input.date).toISOString(),
    merchant: input.merchant.trim() || (input.type === 'income' ? 'Income' : 'Expense'),
    category: input.category,
    amount: input.type === 'expense' ? -magnitude : magnitude,
    type: input.type,
    description: input.description?.trim() || null,
    isRecurring,
    // Stable per-transaction recurring group id so editing keeps it grouped.
    recurringId: isRecurring ? recurringId ?? `man_${id}` : null,
    frequency: isRecurring ? input.frequency ?? 'monthly' : null,
  };
}

export function loadDemoData(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Transaction[]) : null;
  } catch {
    return null;
  }
}

function saveDemoData(txs: Transaction[]) {
  try {
    localStorage.setItem(DEMO_KEY, JSON.stringify(txs));
  } catch {
    /* ignore */
  }
}

interface PendingDelete {
  tx: Transaction;
  index: number; // original position, so Undo restores it in place
}

interface FinanceState {
  transactions: Transaction[];
  hydrated: boolean;
  mode: DataMode;
  period: Period;
  granularity: Granularity;
  hasMore: boolean;
  loadingMore: boolean;
  pendingDelete: PendingDelete | null;

  setPeriod: (p: Period) => void;
  setGranularity: (g: Granularity) => void;

  hydrate: (txs: Transaction[], mode: DataMode) => void;
  loadMore: () => Promise<void>;
  /** Merge freshly-synced server transactions in (by id), keeping date order. */
  mergeServerTransactions: (txs: Transaction[]) => void;

  addTransaction: (input: TransactionInput) => Promise<void>;
  editTransaction: (id: string, input: TransactionInput) => Promise<void>;
  /** Soft-delete: removes from the UI now, commits after a short undo window. */
  removeTransaction: (id: string) => Promise<void>;
  /** Restore the most recently deleted transaction (within the undo window). */
  undoDelete: () => void;
  /** Persist the pending deletion immediately (timer fired, or superseded). */
  commitPendingDelete: () => Promise<void>;
}

// Module-scoped so it survives component unmounts/navigation within the SPA.
let commitTimer: ReturnType<typeof setTimeout> | null = null;
const UNDO_WINDOW_MS = 5000;

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  hydrated: false,
  mode: 'demo',
  period: 'month',
  granularity: 'monthly',
  hasMore: false,
  loadingMore: false,
  pendingDelete: null,

  setPeriod: (period) => set({ period }),
  setGranularity: (granularity) => set({ granularity }),

  // Only signed-in (db) users page in older rows; demo holds everything locally.
  hydrate: (txs, mode) =>
    set({ transactions: txs, mode, hydrated: true, hasMore: mode === 'db' && txs.length >= INITIAL_TRANSACTION_LOAD }),

  // Background auto-sync hands us the recent server window; merge by id so new
  // bank transactions appear without touching older rows the user paged in.
  mergeServerTransactions: (incoming) => {
    if (get().mode !== 'db' || incoming.length === 0) return;
    set((s) => {
      const byId = new Map(s.transactions.map((t) => [t.id, t]));
      let changed = false;
      for (const t of incoming) {
        if (!byId.has(t.id)) changed = true;
        byId.set(t.id, t);
      }
      if (!changed) return {}; // nothing new — avoid a needless re-render
      const merged = [...byId.values()].sort((a, b) => +new Date(b.date) - +new Date(a.date));
      return { transactions: merged };
    });
  },

  loadMore: async () => {
    const { mode, transactions, hasMore, loadingMore } = get();
    if (mode !== 'db' || !hasMore || loadingMore || transactions.length === 0) return;
    set({ loadingMore: true });
    try {
      const oldest = transactions[transactions.length - 1].date;
      const older = await fetchTransactionsBefore(oldest, TRANSACTION_PAGE_SIZE);
      set((s) => ({
        transactions: [...s.transactions, ...older],
        hasMore: older.length >= TRANSACTION_PAGE_SIZE,
        loadingMore: false,
      }));
    } catch {
      set({ loadingMore: false });
    }
  },

  addTransaction: async (input) => {
    if (get().mode === 'demo') {
      const record = toRecord(input);
      const next = [record, ...get().transactions];
      set({ transactions: next });
      saveDemoData(next);
      return;
    }
    const created = await createTransaction(input);
    set((s) => ({ transactions: [created, ...s.transactions] }));
  },

  editTransaction: async (id, input) => {
    if (get().mode === 'demo') {
      const existing = get().transactions.find((t) => t.id === id);
      // Honor the form's recurring choice, but keep the existing group id so an
      // already-recurring transaction stays grouped after an edit.
      const record = toRecord(input, id, existing?.recurringId);
      const next = get().transactions.map((t) => (t.id === id ? record : t));
      set({ transactions: next });
      saveDemoData(next);
      return;
    }
    const updated = await updateTransaction(id, input);
    set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? updated : t)) }));
  },

  removeTransaction: async (id) => {
    // Any prior pending deletion becomes permanent the moment a new one starts.
    await get().commitPendingDelete();

    const txs = get().transactions;
    const index = txs.findIndex((t) => t.id === id);
    if (index === -1) return;
    const tx = txs[index];

    // Remove from the UI immediately (every view updates), but DON'T persist or
    // hit the server yet — that happens on commit, so Undo needs no re-create.
    set({ transactions: txs.filter((t) => t.id !== id), pendingDelete: { tx, index } });

    if (commitTimer) clearTimeout(commitTimer);
    commitTimer = setTimeout(() => {
      void get().commitPendingDelete();
    }, UNDO_WINDOW_MS);
  },

  undoDelete: () => {
    const pd = get().pendingDelete;
    if (!pd) return;
    if (commitTimer) {
      clearTimeout(commitTimer);
      commitTimer = null;
    }
    const next = [...get().transactions];
    next.splice(Math.min(pd.index, next.length), 0, pd.tx);
    set({ transactions: next, pendingDelete: null });
    if (get().mode === 'demo') saveDemoData(next);
  },

  commitPendingDelete: async () => {
    const pd = get().pendingDelete;
    if (!pd) return;
    if (commitTimer) {
      clearTimeout(commitTimer);
      commitTimer = null;
    }
    set({ pendingDelete: null });

    if (get().mode === 'demo') {
      saveDemoData(get().transactions);
      return;
    }
    try {
      await deleteTransaction(pd.tx.id);
    } catch {
      // Server delete failed — put the row back so we never silently lose data.
      const next = [...get().transactions];
      next.splice(Math.min(pd.index, next.length), 0, pd.tx);
      set({ transactions: next });
    }
  },
}));

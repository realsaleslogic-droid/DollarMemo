'use client';

import { create } from 'zustand';
import type { Transaction, TransactionInput, Period, Granularity } from '@/lib/types';
import { createTransaction, updateTransaction, deleteTransaction } from '@/app/actions';

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

interface FinanceState {
  transactions: Transaction[];
  hydrated: boolean;
  mode: DataMode;
  period: Period;
  granularity: Granularity;

  setPeriod: (p: Period) => void;
  setGranularity: (g: Granularity) => void;

  hydrate: (txs: Transaction[], mode: DataMode) => void;

  addTransaction: (input: TransactionInput) => Promise<void>;
  editTransaction: (id: string, input: TransactionInput) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  hydrated: false,
  mode: 'demo',
  period: 'month',
  granularity: 'monthly',

  setPeriod: (period) => set({ period }),
  setGranularity: (granularity) => set({ granularity }),

  hydrate: (txs, mode) => set({ transactions: txs, mode, hydrated: true }),

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
    if (get().mode === 'demo') {
      const next = get().transactions.filter((t) => t.id !== id);
      set({ transactions: next });
      saveDemoData(next);
      return;
    }
    await deleteTransaction(id);
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },
}));

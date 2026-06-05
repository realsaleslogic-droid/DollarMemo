// Client-side replacement for the server actions in src/app/actions.ts.
// No database — it just echoes back well-formed records; the Zustand store
// holds the data and persistence is handled in main.tsx (localStorage).
import type { TransactionInput, Transaction } from '@/lib/types';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function normalize(input: TransactionInput): Transaction {
  const magnitude = Math.abs(Number(input.amount) || 0);
  return {
    id: uid(),
    date: new Date(input.date).toISOString(),
    merchant: input.merchant.trim() || (input.type === 'income' ? 'Income' : 'Expense'),
    category: input.category,
    amount: input.type === 'expense' ? -magnitude : magnitude,
    type: input.type,
    description: input.description?.trim() || null,
    isRecurring: false,
    recurringId: null,
    frequency: null,
  };
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  return normalize(input);
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  return { ...normalize(input), id };
}

export async function deleteTransaction(id: string): Promise<{ id: string }> {
  return { id };
}

import type { Transaction } from './types';

/** Row shape of the Supabase `transactions` table (snake_case). */
export interface Row {
  id: string;
  user_id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: string;
  description: string | null;
  is_recurring: boolean;
  recurring_id: string | null;
  frequency: string | null;
}

export function rowToTransaction(r: Row): Transaction {
  return {
    id: r.id,
    date: new Date(r.date).toISOString(),
    merchant: r.merchant,
    category: r.category,
    amount: r.amount,
    type: r.type as 'income' | 'expense',
    description: r.description,
    isRecurring: r.is_recurring,
    recurringId: r.recurring_id,
    frequency: r.frequency,
  };
}

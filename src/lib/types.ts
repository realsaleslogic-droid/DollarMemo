// Plain serializable shape passed from server components to the client store.
// (Dates are ISO strings so they cross the server/client boundary cleanly.)
export interface Transaction {
  id: string;
  date: string; // ISO
  merchant: string;
  category: string;
  amount: number; // + income, - expense
  type: 'income' | 'expense';
  description: string | null;
  isRecurring: boolean;
  recurringId: string | null;
  frequency: string | null;
}

export type Period = 'today' | 'week' | 'month' | 'year';
export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface TransactionInput {
  date: string;
  merchant: string;
  category: string;
  amount: number; // always positive; sign derived from `type`
  type: 'income' | 'expense';
  description?: string | null;
}

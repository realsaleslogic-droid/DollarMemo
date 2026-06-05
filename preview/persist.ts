import type { Transaction } from '@/lib/types';

const KEY = 'flowtrack-preview-v1';

export function loadTransactions(): Transaction[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? (parsed as Transaction[]) : null;
  } catch {
    return null;
  }
}

export function saveTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(txs));
  } catch {
    /* ignore quota / serialization errors */
  }
}

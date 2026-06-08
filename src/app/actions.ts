'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { rowToTransaction, type Row } from '@/lib/transactionRow';
import { TRANSACTION_COLUMNS, TRANSACTION_PAGE_SIZE } from '@/lib/pagination';
import type { Transaction, TransactionInput } from '@/lib/types';

function normalizeAmount(input: TransactionInput): number {
  const magnitude = Math.abs(Number(input.amount) || 0);
  return input.type === 'expense' ? -magnitude : magnitude;
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return { supabase, user };
}

/** Older transactions for the "Load more" feed (cursor = oldest loaded date). */
export async function fetchTransactionsBefore(
  beforeISO: string,
  limit = TRANSACTION_PAGE_SIZE
): Promise<Transaction[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from('transactions')
    .select(TRANSACTION_COLUMNS)
    .lt('date', beforeISO)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(rowToTransaction);
}

/** Full history — used only on demand (e.g. CSV/PDF export). */
export async function fetchAllTransactions(): Promise<Transaction[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from('transactions')
    .select(TRANSACTION_COLUMNS)
    .order('date', { ascending: false })
    .limit(100000);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(rowToTransaction);
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const { supabase, user } = await requireUser();
  const isRecurring = !!input.isRecurring;
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      date: new Date(input.date).toISOString(),
      merchant: input.merchant.trim() || 'Unknown',
      category: input.category,
      amount: normalizeAmount(input),
      type: input.type,
      description: input.description?.trim() || null,
      is_recurring: isRecurring,
      recurring_id: isRecurring ? crypto.randomUUID() : null,
      frequency: isRecurring ? input.frequency ?? 'monthly' : null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidateAll();
  return rowToTransaction(data as Row);
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  const { supabase, user } = await requireUser();
  const isRecurring = !!input.isRecurring;

  // Preserve the existing group id if it was already recurring; otherwise mint
  // a new one when newly marked recurring.
  let recurringId: string | null = null;
  if (isRecurring) {
    const { data: existing } = await supabase
      .from('transactions')
      .select('recurring_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    recurringId = (existing?.recurring_id as string | null) ?? crypto.randomUUID();
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({
      date: new Date(input.date).toISOString(),
      merchant: input.merchant.trim() || 'Unknown',
      category: input.category,
      amount: normalizeAmount(input),
      type: input.type,
      description: input.description?.trim() || null,
      is_recurring: isRecurring,
      recurring_id: recurringId,
      frequency: isRecurring ? input.frequency ?? 'monthly' : null,
    })
    .eq('id', id)
    .eq('user_id', user.id) // RLS also enforces this
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidateAll();
  return rowToTransaction(data as Row);
}

export async function deleteTransaction(id: string): Promise<{ id: string }> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw new Error(error.message);
  revalidateAll();
  return { id };
}

function revalidateAll() {
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/reports');
  revalidatePath('/recurring');
}

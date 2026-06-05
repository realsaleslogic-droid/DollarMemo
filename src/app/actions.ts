'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { rowToTransaction, type Row } from '@/lib/transactionRow';
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

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const { supabase, user } = await requireUser();
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
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidateAll();
  return rowToTransaction(data as Row);
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from('transactions')
    .update({
      date: new Date(input.date).toISOString(),
      merchant: input.merchant.trim() || 'Unknown',
      category: input.category,
      amount: normalizeAmount(input),
      type: input.type,
      description: input.description?.trim() || null,
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

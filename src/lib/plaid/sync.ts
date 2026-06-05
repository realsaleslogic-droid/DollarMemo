import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RemovedTransaction, Transaction as PlaidTransaction } from 'plaid';
import { plaidClient } from './client';
import { decryptToken } from './crypto';
import { mapPlaidCategory } from './categoryMap';

export interface PlaidItemRow {
  id: string;
  user_id: string;
  item_id: string;
  access_token: string; // encrypted
  cursor: string | null;
  institution_name: string | null;
}

export interface SyncResult {
  added: number;
  modified: number;
  removed: number;
}

// Plaid amounts are positive when money LEAVES the account (an expense) and
// negative when money ENTERS (income). FlowTrack stores signed amounts the
// other way: + for income, - for expense. So app amount = -plaidAmount.
function toTransactionRow(userId: string, t: PlaidTransaction) {
  const isExpense = t.amount > 0;
  const merchant = t.merchant_name || t.name || 'Unknown';
  return {
    user_id: userId,
    external_id: t.transaction_id,
    account_id: t.account_id,
    source: 'plaid',
    date: new Date(t.authorized_date ?? t.date).toISOString(),
    merchant,
    category: mapPlaidCategory(t.personal_finance_category?.primary, t.category),
    amount: -t.amount,
    type: isExpense ? 'expense' : 'income',
    description: t.merchant_name && t.name !== t.merchant_name ? t.name : null,
    pending: t.pending,
    is_recurring: false,
  };
}

/** Pull all transaction updates for a single linked item and persist them. */
export async function syncItem(admin: SupabaseClient, item: PlaidItemRow): Promise<SyncResult> {
  const accessToken = decryptToken(item.access_token);
  const plaid = plaidClient();

  let cursor = item.cursor ?? undefined;
  let hasMore = true;
  const added: PlaidTransaction[] = [];
  const modified: PlaidTransaction[] = [];
  const removed: RemovedTransaction[] = [];

  // transactions/sync is cursor-paginated; loop until caught up.
  while (hasMore) {
    const resp = await plaid.transactionsSync({
      access_token: accessToken,
      cursor,
      count: 500,
    });
    const data = resp.data;
    added.push(...data.added);
    modified.push(...data.modified);
    removed.push(...data.removed);
    hasMore = data.has_more;
    cursor = data.next_cursor;
  }

  // Upsert added + modified (idempotent on user_id + external_id).
  const upsertRows = [...added, ...modified].map((t) => toTransactionRow(item.user_id, t));
  if (upsertRows.length) {
    const { error } = await admin
      .from('transactions')
      .upsert(upsertRows, { onConflict: 'user_id,external_id' });
    if (error) throw new Error(`Upsert failed: ${error.message}`);
  }

  // Delete removed transactions.
  const removedIds = removed.map((r) => r.transaction_id).filter(Boolean) as string[];
  if (removedIds.length) {
    const { error } = await admin
      .from('transactions')
      .delete()
      .eq('user_id', item.user_id)
      .in('external_id', removedIds);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  }

  // Persist the new cursor so the next sync only fetches the delta.
  await admin
    .from('plaid_items')
    .update({
      cursor: cursor ?? null,
      status: 'active',
      error: null,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id);

  return { added: added.length, modified: modified.length, removed: removed.length };
}

/** Sync every linked item for a user. Per-item errors are recorded, not thrown. */
export async function syncAllItemsForUser(
  admin: SupabaseClient,
  userId: string
): Promise<SyncResult> {
  const { data, error } = await admin
    .from('plaid_items')
    .select('id, user_id, item_id, access_token, cursor, institution_name')
    .eq('user_id', userId)
    .neq('status', 'revoked');
  if (error) throw new Error(error.message);

  const totals: SyncResult = { added: 0, modified: 0, removed: 0 };
  for (const item of (data ?? []) as PlaidItemRow[]) {
    try {
      const r = await syncItem(admin, item);
      totals.added += r.added;
      totals.modified += r.modified;
      totals.removed += r.removed;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown sync error';
      await admin
        .from('plaid_items')
        .update({ status: 'error', error: message, updated_at: new Date().toISOString() })
        .eq('id', item.id);
    }
  }
  return totals;
}

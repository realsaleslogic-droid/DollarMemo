import 'server-only';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { categorizeStripe, cleanMerchant } from './categorize';

export interface SyncResult {
  added: number;
}

// Stripe Financial Connections amounts are signed the same way DollarMemo
// stores them: a positive value is money entering the account (a credit /
// income), a negative value is money leaving (a debit / expense). So we divide
// by 100 and keep the sign; the type follows from it.
function toRow(userId: string, accountId: string, t: Stripe.FinancialConnections.Transaction) {
  const ts =
    t.transacted_at ?? t.status_transitions?.posted_at ?? Math.floor(Date.now() / 1000);
  const amount = t.amount / 100;
  const isIncome = t.amount >= 0;
  return {
    user_id: userId,
    external_id: t.id,
    account_id: accountId,
    source: 'stripe',
    date: new Date(ts * 1000).toISOString(),
    merchant: cleanMerchant(t.description),
    category: isIncome ? 'Income' : categorizeStripe(t.description),
    amount,
    type: isIncome ? 'income' : 'expense',
    description: null,
    pending: t.status === 'pending',
    is_recurring: false,
  };
}

/** Pull transactions for every linked account and upsert them for the user. */
export async function syncStripeForUser(
  admin: SupabaseClient,
  stripe: Stripe,
  userId: string
): Promise<SyncResult> {
  const { data: accounts, error } = await admin
    .from('stripe_accounts')
    .select('id, account_id')
    .eq('user_id', userId)
    .neq('status', 'disconnected');
  if (error) throw new Error(error.message);

  let added = 0;
  for (const acct of accounts ?? []) {
    const accountId = acct.account_id as string;
    try {
      const rows: ReturnType<typeof toRow>[] = [];
      let startingAfter: string | undefined;
      // Page through this account's transactions.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await stripe.financialConnections.transactions.list({
          account: accountId,
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        for (const t of page.data) {
          if (t.status === 'void') continue;
          rows.push(toRow(userId, accountId, t));
        }
        if (!page.has_more || page.data.length === 0) break;
        startingAfter = page.data[page.data.length - 1].id;
      }

      if (rows.length) {
        const { error: upErr } = await admin
          .from('transactions')
          .upsert(rows, { onConflict: 'user_id,external_id' });
        if (upErr) throw new Error(upErr.message);
        added += rows.length;
      }

      await admin
        .from('stripe_accounts')
        .update({ status: 'active', error: null, last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', acct.id);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown sync error';
      await admin
        .from('stripe_accounts')
        .update({ status: 'error', error: message, updated_at: new Date().toISOString() })
        .eq('id', acct.id);
    }
  }

  return { added };
}

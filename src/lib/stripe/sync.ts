import 'server-only';
import type Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { categorizeTransaction } from './categorize';
import { llmCategorize, isLlmCategorizationEnabled } from './llm-categorize';
import { prettyMerchant, merchantKey } from '@/lib/merchant';

export interface SyncResult {
  added: number;
}

type Rule = { category: string; source: string };

/**
 * Decide a transaction's category. Priority: a user's manual correction always
 * wins; then the keyword map analyzing both the cleaned name and the raw bank/
 * processor descriptor; then a cached automatic result; otherwise 'Other'
 * (a candidate for the optional LLM pass).
 */
function decideCategory(
  rawDescription: string,
  merchant: string,
  isIncome: boolean,
  rules: Map<string, Rule>
): string {
  if (isIncome) return 'Income';
  const rule = rules.get(merchantKey(merchant));
  if (rule?.source === 'user') return rule.category;
  const kw = categorizeTransaction(rawDescription, merchant);
  if (kw !== 'Other') return kw;
  return rule?.category ?? 'Other';
}

// How much transaction history to import when an account is linked. 6 months
// gives recurring detection and trend charts enough data without an oversized
// first sync. (Stripe only returns what each bank shares, so the real depth can
// be less.)
const HISTORY_MONTHS = 6;

function historyCutoff(): number {
  const d = new Date();
  d.setMonth(d.getMonth() - HISTORY_MONTHS);
  return Math.floor(d.getTime() / 1000);
}

/** Best-effort transaction timestamp (unix seconds). */
function txnTimestamp(t: Stripe.FinancialConnections.Transaction): number {
  return t.transacted_at ?? t.status_transitions?.posted_at ?? Math.floor(Date.now() / 1000);
}

// Stripe Financial Connections amounts are signed the same way DollarMemo
// stores them: a positive value is money entering the account (a credit /
// income), a negative value is money leaving (a debit / expense). So we divide
// by 100 and keep the sign; the type follows from it.
function toRow(
  userId: string,
  accountId: string,
  t: Stripe.FinancialConnections.Transaction,
  rules: Map<string, Rule>
) {
  const ts = txnTimestamp(t);
  const amount = t.amount / 100;
  const isIncome = t.amount >= 0;
  const raw = t.description ?? '';
  const merchant = prettyMerchant(raw);
  return {
    user_id: userId,
    external_id: t.id,
    account_id: accountId,
    source: 'stripe',
    date: new Date(ts * 1000).toISOString(),
    merchant,
    category: decideCategory(raw, merchant, isIncome, rules),
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

  // The user's learned category rules (manual corrections + cached results).
  const { data: ruleRows } = await admin
    .from('merchant_categories')
    .select('merchant_key, category, source')
    .eq('user_id', userId);
  const rules = new Map<string, Rule>(
    (ruleRows ?? []).map((r) => [r.merchant_key as string, { category: r.category as string, source: r.source as string }])
  );

  const cutoff = historyCutoff();
  const unknown = new Map<string, string>(); // merchant name -> merchant key (expenses left as Other)
  let added = 0;

  for (const acct of accounts ?? []) {
    const accountId = acct.account_id as string;
    try {
      const rows: ReturnType<typeof toRow>[] = [];
      let startingAfter: string | undefined;
      // Page through this account's transactions, keeping only the last
      // HISTORY_MONTHS of history.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const page = await stripe.financialConnections.transactions.list({
          account: accountId,
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        for (const t of page.data) {
          if (t.status === 'void') continue;
          if (txnTimestamp(t) < cutoff) continue;
          const row = toRow(userId, accountId, t, rules);
          rows.push(row);
          if (row.type === 'expense' && row.category === 'Other') unknown.set(row.merchant, merchantKey(row.merchant));
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

  // Optional: classify still-unknown merchants with the LLM, cache the result,
  // and re-categorize those transactions. No-op when ANTHROPIC_API_KEY is unset.
  if (unknown.size > 0 && isLlmCategorizationEnabled()) {
    try {
      const result = await llmCategorize([...unknown.keys()]);
      if (result.size > 0) {
        const now = new Date().toISOString();
        const cacheRows = [...result].map(([merchant, category]) => ({
          user_id: userId,
          merchant_key: unknown.get(merchant)!,
          category,
          source: 'auto',
          updated_at: now,
        }));
        // Don't overwrite a user's manual rule.
        await admin
          .from('merchant_categories')
          .upsert(cacheRows, { onConflict: 'user_id,merchant_key', ignoreDuplicates: true });

        // Apply, grouped by category, only to rows still marked Other.
        const byCategory = new Map<string, string[]>();
        for (const [merchant, category] of result) {
          const arr = byCategory.get(category) ?? [];
          arr.push(merchant);
          byCategory.set(category, arr);
        }
        for (const [category, merchants] of byCategory) {
          await admin
            .from('transactions')
            .update({ category })
            .eq('user_id', userId)
            .eq('category', 'Other')
            .in('merchant', merchants);
        }
      }
    } catch {
      /* LLM categorization is best-effort */
    }
  }

  return { added };
}

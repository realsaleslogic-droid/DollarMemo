'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripeClient } from '@/lib/stripe/client';
import { assertStripeConfigured } from '@/lib/stripe/config';
import { getOrCreateCustomer } from '@/lib/stripe/customer';
import { getUserPlan, accountLimit, ACCOUNT_LIMITS } from '@/lib/stripe/plan';
import { syncStripeForUser, type SyncResult } from '@/lib/stripe/sync';

export interface Connection {
  id: string;
  institutionName: string | null;
  last4: string | null;
  status: string;
  lastSyncedAt: string | null;
  error: string | null;
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

function revalidateAll() {
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/reports');
  revalidatePath('/recurring');
  revalidatePath('/accounts');
}

/** Create a Financial Connections session; returns its client secret for Stripe.js. */
export async function createFcSession(): Promise<{ clientSecret: string }> {
  assertStripeConfigured();
  const user = await requireUser();
  const stripe = stripeClient();

  const customer = await getOrCreateCustomer(user);
  const session = await stripe.financialConnections.sessions.create({
    account_holder: { type: 'customer', customer },
    permissions: ['transactions', 'balances'],
    prefetch: ['transactions'],
  });
  if (!session.client_secret) throw new Error('Could not start the bank connection.');
  return { clientSecret: session.client_secret };
}

/** Persist the accounts the user linked, subscribe to transactions, and sync. */
export async function linkAccounts(accountIds: string[]): Promise<SyncResult> {
  assertStripeConfigured();
  const user = await requireUser();
  const stripe = stripeClient();
  const admin = createAdminClient();

  // Enforce the plan's connected-account limit.
  const plan = await getUserPlan(admin, user.id);
  const limit = accountLimit(plan);
  const { count } = await admin
    .from('stripe_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  const existing = count ?? 0;
  if (existing + accountIds.length > limit) {
    throw new Error(
      plan === 'free'
        ? `Your free plan includes ${limit} bank account. Upgrade to Pro to connect up to ${ACCOUNT_LIMITS.pro}.`
        : `Your plan allows up to ${limit} connected accounts.`
    );
  }

  for (const id of accountIds) {
    const account = await stripe.financialConnections.accounts.retrieve(id);
    // Subscribe so Stripe keeps transactions fresh (best-effort).
    try {
      await stripe.financialConnections.accounts.subscribe(id, { features: ['transactions'] });
    } catch {
      /* feature may need enabling; sync still attempts a fetch */
    }
    await admin.from('stripe_accounts').upsert(
      {
        user_id: user.id,
        account_id: id,
        institution_name: account.institution_name ?? null,
        last4: account.last4 ?? null,
        display_name: account.display_name ?? null,
        status: 'active',
        error: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id' }
    );
  }

  const result = await syncStripeForUser(admin, stripe, user.id);
  revalidateAll();
  return result;
}

// Minimum spacing between syncs for one user. Set just under the post-connect
// auto-import poll interval (6s) so the legitimate first-import retries and a
// normal manual "Sync now" always pass, while a scripted sync loop is throttled
// to ~one call every few seconds instead of hammering Stripe.
const SYNC_COOLDOWN_MS = 5000;

/** Manually re-sync all linked accounts (rate-limited per user). */
export async function syncTransactions(): Promise<SyncResult> {
  assertStripeConfigured();
  const user = await requireUser();
  const admin = createAdminClient();

  // Cooldown gate: if this user's accounts were synced within the last few
  // seconds, skip hitting Stripe and report "nothing new". Read from the DB so
  // the limit holds across serverless instances (in-memory wouldn't). The
  // auto-import polls every 6s, comfortably above the 5s window.
  const { data: recent } = await admin
    .from('stripe_accounts')
    .select('last_synced_at')
    .eq('user_id', user.id)
    .not('last_synced_at', 'is', null)
    .order('last_synced_at', { ascending: false })
    .limit(1);
  const lastAt = recent?.[0]?.last_synced_at
    ? new Date(recent[0].last_synced_at as string).getTime()
    : 0;
  if (Date.now() - lastAt < SYNC_COOLDOWN_MS) {
    return { added: 0 };
  }

  const result = await syncStripeForUser(admin, stripeClient(), user.id);
  revalidateAll();
  return result;
}

/** Safe, non-secret list of the user's linked institutions. */
export async function listConnections(): Promise<Connection[]> {
  const user = await requireUser();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('stripe_accounts')
    .select('id, institution_name, last4, status, last_synced_at, error')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    institutionName: r.institution_name as string | null,
    last4: r.last4 as string | null,
    status: r.status as string,
    lastSyncedAt: r.last_synced_at as string | null,
    error: r.error as string | null,
  }));
}

/** Disconnect a linked account at Stripe and delete the stored reference. */
export async function removeConnection(id: string): Promise<{ id: string }> {
  assertStripeConfigured();
  const user = await requireUser();
  const admin = createAdminClient();

  const { data } = await admin
    .from('stripe_accounts')
    .select('account_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (data?.account_id) {
    try {
      await stripeClient().financialConnections.accounts.disconnect(data.account_id as string);
    } catch {
      /* still remove our reference below */
    }
  }
  await admin.from('stripe_accounts').delete().eq('id', id).eq('user_id', user.id);
  revalidateAll();
  return { id };
}

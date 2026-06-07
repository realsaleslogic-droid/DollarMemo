'use server';

import { revalidatePath } from 'next/cache';
import type Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripeClient } from '@/lib/stripe/client';
import { assertStripeConfigured } from '@/lib/stripe/config';
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

/** Get (or lazily create) the Stripe customer that owns this user's links. */
async function getOrCreateCustomer(
  admin: ReturnType<typeof createAdminClient>,
  stripe: Stripe,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
): Promise<string> {
  const { data } = await admin
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', user.id)
    .single();
  if (data?.customer_id) return data.customer_id as string;

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: (user.user_metadata?.name as string | undefined) ?? undefined,
    metadata: { supabase_user_id: user.id },
  });
  await admin.from('stripe_customers').insert({ user_id: user.id, customer_id: customer.id });
  return customer.id;
}

/** Create a Financial Connections session; returns its client secret for Stripe.js. */
export async function createFcSession(): Promise<{ clientSecret: string }> {
  assertStripeConfigured();
  const user = await requireUser();
  const stripe = stripeClient();
  const admin = createAdminClient();

  const customer = await getOrCreateCustomer(admin, stripe, user);
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

/** Manually re-sync all linked accounts. */
export async function syncTransactions(): Promise<SyncResult> {
  assertStripeConfigured();
  const user = await requireUser();
  const result = await syncStripeForUser(createAdminClient(), stripeClient(), user.id);
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

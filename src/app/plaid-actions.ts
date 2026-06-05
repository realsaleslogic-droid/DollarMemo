'use server';

import { revalidatePath } from 'next/cache';
import { CountryCode, Products } from 'plaid';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { plaidClient } from '@/lib/plaid/client';
import { encryptToken } from '@/lib/plaid/crypto';
import { syncAllItemsForUser, type SyncResult } from '@/lib/plaid/sync';
import {
  assertPlaidConfigured,
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS,
  PLAID_WEBHOOK_URL,
} from '@/lib/plaid/config';

export interface Connection {
  id: string;
  institutionName: string | null;
  status: string;
  lastSyncedAt: string | null;
  error: string | null;
}

async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

function revalidateAll() {
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/reports');
  revalidatePath('/recurring');
  revalidatePath('/accounts');
}

/** Create a short-lived Plaid Link token to open Plaid Link on the client. */
export async function createLinkToken(): Promise<string> {
  assertPlaidConfigured();
  const userId = await requireUserId();
  const plaid = plaidClient();

  const resp = await plaid.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'FlowTrack',
    products: PLAID_PRODUCTS as unknown as Products[],
    country_codes: PLAID_COUNTRY_CODES as unknown as CountryCode[],
    language: 'en',
    ...(PLAID_WEBHOOK_URL ? { webhook: `${PLAID_WEBHOOK_URL}/api/plaid/webhook` } : {}),
  });
  return resp.data.link_token;
}

/**
 * Exchange the public token from Plaid Link for a permanent access token,
 * persist the (encrypted) item, and run the first transaction sync.
 */
export async function exchangePublicToken(
  publicToken: string,
  institution?: { id?: string | null; name?: string | null }
): Promise<SyncResult> {
  assertPlaidConfigured();
  const userId = await requireUserId();
  const plaid = plaidClient();
  const admin = createAdminClient();

  const exchange = await plaid.itemPublicTokenExchange({ public_token: publicToken });
  const accessToken = exchange.data.access_token;
  const itemId = exchange.data.item_id;

  const { error } = await admin.from('plaid_items').upsert(
    {
      user_id: userId,
      item_id: itemId,
      access_token: encryptToken(accessToken),
      institution_id: institution?.id ?? null,
      institution_name: institution?.name ?? null,
      status: 'active',
      error: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'item_id' }
  );
  if (error) throw new Error(`Could not save linked account: ${error.message}`);

  const result = await syncAllItemsForUser(admin, userId);
  revalidateAll();
  return result;
}

/** Manually trigger a transaction sync for all of the user's linked accounts. */
export async function syncTransactions(): Promise<SyncResult> {
  assertPlaidConfigured();
  const userId = await requireUserId();
  const admin = createAdminClient();
  const result = await syncAllItemsForUser(admin, userId);
  revalidateAll();
  return result;
}

/** List the user's linked institutions (safe, non-secret metadata only). */
export async function listConnections(): Promise<Connection[]> {
  const userId = await requireUserId();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('plaid_items')
    .select('id, institution_name, status, last_synced_at, error')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    institutionName: r.institution_name as string | null,
    status: r.status as string,
    lastSyncedAt: r.last_synced_at as string | null,
    error: r.error as string | null,
  }));
}

/** Unlink an institution: revoke the item at Plaid and delete the stored token. */
export async function removeConnection(id: string): Promise<{ id: string }> {
  assertPlaidConfigured();
  const userId = await requireUserId();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('plaid_items')
    .select('id, access_token')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  if (error || !data) throw new Error('Connection not found');

  try {
    const { decryptToken } = await import('@/lib/plaid/crypto');
    await plaidClient().itemRemove({ access_token: decryptToken(data.access_token as string) });
  } catch {
    // If Plaid revocation fails we still remove our stored token below.
  }

  await admin.from('plaid_items').delete().eq('id', id).eq('user_id', userId);
  revalidateAll();
  return { id };
}

// Central Plaid configuration read from server-side env. Importing this module
// is safe even when Plaid isn't configured — use `isPlaidConfigured()` to gate
// behavior so the rest of the app keeps working without credentials.

import 'server-only';

export const PLAID_ENV = (process.env.PLAID_ENV ?? 'sandbox').toLowerCase();

export const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS ?? 'transactions')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES ?? 'US')
  .split(',')
  .map((s) => s.trim().toUpperCase())
  .filter(Boolean);

export const PLAID_WEBHOOK_URL = process.env.PLAID_WEBHOOK_URL?.trim() || undefined;

/** True only when every secret required to talk to Plaid + store tokens is set. */
export function isPlaidConfigured(): boolean {
  return Boolean(
    process.env.PLAID_CLIENT_ID &&
      process.env.PLAID_SECRET &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.APP_ENCRYPTION_KEY
  );
}

/** Throw a clear, user-actionable error when called without configuration. */
export function assertPlaidConfigured(): void {
  if (!isPlaidConfigured()) {
    throw new Error(
      'Bank sync is not configured. Set PLAID_CLIENT_ID, PLAID_SECRET, ' +
        'SUPABASE_SERVICE_ROLE_KEY and APP_ENCRYPTION_KEY in your environment. See PLAID.md.'
    );
  }
}

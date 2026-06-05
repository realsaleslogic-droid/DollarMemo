import 'server-only';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { PLAID_ENV } from './config';

// Server-side Plaid API client. Created lazily so importing this module never
// throws when Plaid is unconfigured (the call sites gate on isPlaidConfigured).
let cached: PlaidApi | null = null;

export function plaidClient(): PlaidApi {
  if (cached) return cached;
  const basePath = PlaidEnvironments[PLAID_ENV] ?? PlaidEnvironments.sandbox;
  const configuration = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  });
  cached = new PlaidApi(configuration);
  return cached;
}

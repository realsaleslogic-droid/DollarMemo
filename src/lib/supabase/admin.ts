import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service-role Supabase client. Bypasses row-level security, so it is used ONLY
// on the server for privileged operations the user's session cannot do — namely
// reading/writing the plaid_items table that holds bank access tokens.
//
// NEVER import this from a Client Component. Always re-check the user's identity
// (with the cookie-bound client) before acting on their behalf with this client.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Supabase service role is not configured (SUPABASE_SERVICE_ROLE_KEY).');
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

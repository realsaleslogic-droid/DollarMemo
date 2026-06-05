import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPlaidConfigured } from '@/lib/plaid/config';
import { syncItem, type PlaidItemRow } from '@/lib/plaid/sync';

// Plaid calls this endpoint when new transaction data is available so we can
// sync in the background (set PLAID_WEBHOOK_URL to your public base URL).
//
// NOTE: For production, add full Plaid webhook JWT verification using the
// `plaid-verification` header + /webhook_verification_key/get. The handler below
// is idempotent and only triggers a delta sync, which limits abuse, but signed
// verification should be added before relying on this in production.
export async function POST(req: Request) {
  if (!isPlaidConfigured()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  let body: { webhook_type?: string; webhook_code?: string; item_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_json' }, { status: 400 });
  }

  // We only act on transactions updates; ignore the rest (auth, item, etc.).
  if (body.webhook_type === 'TRANSACTIONS' && body.item_id) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('plaid_items')
      .select('id, user_id, item_id, access_token, cursor, institution_name')
      .eq('item_id', body.item_id)
      .single();
    if (data) {
      try {
        await syncItem(admin, data as PlaidItemRow);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'sync error';
        await admin
          .from('plaid_items')
          .update({ status: 'error', error: message, updated_at: new Date().toISOString() })
          .eq('id', (data as PlaidItemRow).id);
      }
    }
  }

  // Always 200 so Plaid doesn't retry indefinitely on benign webhooks.
  return NextResponse.json({ ok: true });
}

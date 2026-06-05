# Bank & Card Sync (Plaid)

FlowTrack links real bank and credit-card accounts through **[Plaid](https://plaid.com)**.
Users connect an institution via **Plaid Link**, and transactions are pulled in,
**categorized**, de-duplicated, and stored on their account — appearing across
the dashboard, transactions, reports, and recurring views automatically.

```
Plaid Link (browser)  ──public_token──►  exchange (server)
        ▲                                     │ access_token (encrypted)
   link_token                                 ▼
 createLinkToken ◄───────────────────  plaid_items  (service-role only)
                                              │
            transactions/sync (cursor) ◄──────┘
                                              ▼
                          upsert into `transactions` (RLS, per-user)
```

## 1. Prerequisites

- A Supabase project with `supabase/sql/transactions.sql` already applied (see [SUPABASE.md](./SUPABASE.md)).
- A Plaid account: <https://dashboard.plaid.com/signup>.
  - **Sandbox** keys work immediately and are free — develop here first.
  - **Production** requires requesting production access in the Plaid dashboard
    (Plaid reviews your use case). Once approved you get a separate Production
    secret. Going live is just a key + `PLAID_ENV` change — no code change.

## 2. Run the database migration

In **Supabase → SQL Editor**, run **`supabase/sql/plaid.sql`** once. It:

- creates `plaid_items` (stores **encrypted** bank access tokens; locked down so
  only the server's service-role key can read it — the browser never can);
- adds `source`, `external_id`, `account_id`, `pending` columns to `transactions`
  plus a unique index so re-syncing is an idempotent upsert (no duplicates).

## 3. Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable | Where to get it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | already used by the app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` | **server secret** — never expose |
| `PLAID_CLIENT_ID` | Plaid → Team Settings → Keys | |
| `PLAID_SECRET` | Plaid → Team Settings → Keys | the secret for your `PLAID_ENV` |
| `PLAID_ENV` | — | `sandbox` (default) or `production` |
| `PLAID_PRODUCTS` | — | default `transactions` |
| `PLAID_COUNTRY_CODES` | — | default `US` |
| `APP_ENCRYPTION_KEY` | generate (below) | 32-byte key, encrypts tokens at rest |
| `PLAID_WEBHOOK_URL` | your public URL | optional; enables background sync |

Generate the encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> Bank sync stays disabled (the Accounts page shows a setup notice) until
> `PLAID_CLIENT_ID`, `PLAID_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and
> `APP_ENCRYPTION_KEY` are all set.

## 4. Use it

1. `npm run dev`, sign in (real account, not demo), go to **Accounts**.
2. Click **Connect a bank or card** → Plaid Link opens.
   - In **Sandbox**, use institution "First Platypus Bank" with credentials
     `user_good` / `pass_good`.
3. On success the first sync runs; transactions appear app-wide.
4. **Sync now** pulls new transactions on demand; **Unlink** revokes the item at
   Plaid and deletes the stored token.

## 5. Background sync (optional)

Set `PLAID_WEBHOOK_URL` to your deployed base URL (e.g. `https://yourapp.com`).
Plaid then calls `POST /api/plaid/webhook` on new data and the server syncs
automatically. **Production hardening:** add Plaid webhook JWT verification
(`plaid-verification` header + `/webhook_verification_key/get`) in
`src/app/api/plaid/webhook/route.ts` before relying on it in production.

## How it maps to FlowTrack

- **Amounts** — Plaid is positive for money leaving the account; FlowTrack stores
  `+` income / `-` expense, so amounts are negated and the type is derived from
  the sign (`src/lib/plaid/sync.ts`).
- **Categories** — Plaid's Personal Finance Category → FlowTrack categories in
  `src/lib/plaid/categoryMap.ts` (edit to taste).
- **De-dup** — keyed on `(user_id, external_id = Plaid transaction_id)`; pending
  transactions are replaced when they post.

## Security notes

- Bank credentials are entered in Plaid Link and **never touch FlowTrack**.
- Access tokens are **encrypted (AES-256-GCM)** and stored in a table only the
  **service-role** server client can read — unreachable with the public key.
- All synced rows are protected by the existing per-user **row-level security**.
- `.env` is gitignored; never commit real secrets.

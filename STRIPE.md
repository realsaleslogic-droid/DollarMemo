# Bank & Card Sync (Stripe Financial Connections)

DollarMemo links real bank and credit-card accounts through **[Stripe Financial
Connections](https://stripe.com/financial-connections)**. Users connect an
institution via Stripe's secure modal, and transactions are pulled in,
**categorized**, de-duplicated, and stored on their account — appearing across
the dashboard, transactions, reports, and recurring views automatically.

```
Stripe.js modal (browser)  ──account ids──►  linkAccounts (server)
        ▲                                          │ subscribe to transactions
   client_secret                                   ▼
 createFcSession ◄────────────────────────  stripe_accounts (service-role only)
                                                   │
              transactions.list (Stripe) ◄─────────┘
                                                   ▼
                            upsert into `transactions` (RLS, per-user)
```

## 1. Prerequisites

- A Supabase project with `supabase/sql/transactions.sql` applied (see [SUPABASE.md](./SUPABASE.md)).
- A Stripe account: <https://dashboard.stripe.com>.
- **Enable Financial Connections** and its **Transactions** feature:
  Stripe Dashboard → **Settings → Financial Connections** (and request the
  Transactions feature if it isn't already on). Test mode works immediately with
  Stripe's sandbox institutions.

## 2. Run the database migration

In **Supabase → SQL Editor**, run **`supabase/sql/stripe.sql`** once. It creates
`stripe_customers` and `stripe_accounts` (service-role-only), and adds the
`source` / `external_id` / `account_id` / `pending` columns + a unique index to
`transactions` so re-syncing is idempotent (no duplicates).

## 3. Environment variables

Copy `.env.example` → `.env` and fill in:

| Variable | Where to get it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | already used by the app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` | **server secret** |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys | **server secret** (`sk_test_…` / `sk_live_…`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys | public-safe (`pk_test_…` / `pk_live_…`) |

> Bank sync stays disabled (the Accounts page shows a setup notice) until
> `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and
> `SUPABASE_SERVICE_ROLE_KEY` are all set. On Vercel, add these in
> **Project → Settings → Environment Variables** and redeploy.

## 4. Use it

1. `npm run dev`, sign in (real account, not demo), go to **Accounts**.
2. Click **Connect a bank or card** → the Stripe modal opens.
   - In **test mode**, pick a Stripe test bank and use the provided test login.
3. On success the first sync runs; transactions appear app-wide.
4. **Sync now** pulls new transactions on demand; **Unlink** disconnects the
   account at Stripe and removes the stored reference.

## How it maps to DollarMemo

- **Amounts** — Stripe Financial Connections is signed the same way DollarMemo
  stores values: positive = money in (income), negative = money out (expense).
  We divide by 100 and keep the sign (`src/lib/stripe/sync.ts`).
- **Categories** — Stripe sends a description, not a category, so we infer one.
  Priority: a user's manual correction (remembered per merchant in
  `merchant_categories`, run `supabase/sql/categories.sql` once) → the keyword
  map (`src/lib/stripe/categorize.ts`) → optional Claude categorization for
  unknown merchants (set `ANTHROPIC_API_KEY`; results are cached so it's cheap)
  → `Other`. Editing a transaction's category teaches the app for next time.
- **De-dup** — keyed on `(user_id, external_id = Stripe transaction id)`.
- **History window** — on link we backfill the last **6 months** of
  transactions (`HISTORY_MONTHS` in `src/lib/stripe/sync.ts`). Stripe only returns
  what each bank shares, so the real depth can be shorter.

## Paid plans (Stripe Billing)

Free users can connect **1** bank; **Pro** users can connect up to **5**. Pricing
lives in code — edit `PRICES` / `ACCOUNT_LIMITS` in `src/lib/stripe/plan.ts`
(defaults: $7.99/mo, $59.99/yr). No Stripe Price IDs are needed (Checkout uses
inline `price_data`).

To enable Pro:

1. Run **`supabase/sql/billing.sql`** once (adds subscription columns to
   `stripe_customers`).
2. **Webhook:** Stripe Dashboard → Developers → Webhooks → add an endpoint at
   `https://<your-app>/api/stripe/webhook` for events
   `checkout.session.completed` and `customer.subscription.created/updated/deleted`.
   Put its signing secret in **`STRIPE_WEBHOOK_SECRET`**.
3. **Customer portal:** Dashboard → Settings → Billing → Customer portal → enable
   it (so users can manage/cancel from the app).
4. Users upgrade at **/upgrade** (linked from Settings and the Accounts page when
   they hit the free limit). The flow: Checkout → webhook updates their plan →
   the account limit lifts.

## Security notes

- Bank credentials are entered in Stripe's modal and **never touch DollarMemo**.
- We store only an account reference (`fca_…`), used server-side with your
  secret key to fetch transactions; the `stripe_accounts` / `stripe_customers`
  tables are reachable only by the service-role server client.
- All synced rows are protected by the existing per-user **row-level security**.
- `.env` is gitignored; never commit real secrets.

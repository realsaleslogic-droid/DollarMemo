# Connecting FlowTrack to Supabase

FlowTrack uses **Supabase Auth** for accounts and **Supabase Postgres** (with
Row-Level Security) for transactions, talked to via `@supabase/supabase-js` +
`@supabase/ssr`. Everything authenticates from the browser with the **public
anon/publishable key**, so no database password or server-side connection
string is required.

## 1. Env vars

`.env` (already filled in for project `DatabaseForApp`):

```env
NEXT_PUBLIC_SUPABASE_URL="https://uvlkvotcnpysyxwyfmtw.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."   # publishable key — safe to expose
```

Find these in Supabase → **Project Settings → API**.

## 2. Create the `transactions` table (one time)

Accounts are stored automatically by Supabase Auth (`auth.users`). You only need
the app's data table. In Supabase → **SQL Editor → New query**, paste and run
[`supabase/sql/transactions.sql`](./supabase/sql/transactions.sql). It creates
`public.transactions` with indexes and **Row-Level Security** so each user can
only read/write their own rows.

## 3. Auth settings

Supabase → **Authentication**:

- **Email**: enabled by default. For instant sign-up (no email step) turn **off**
  *Authentication → Providers → Email → "Confirm email"*. Leave it on if you want
  users to verify their address (they'll get a confirmation link).
- **Google** (optional): *Authentication → Providers → Google* — add your Google
  OAuth client ID/secret. Then in **URL Configuration**, add your redirect URL:
  `<your-site>/auth/callback` (e.g. `http://localhost:3000/auth/callback` for dev).
- **Site URL / redirect URLs**: add `http://localhost:3000` for dev and your
  production domain.

## 4. Run

```bash
npm install
npm run dev          # http://localhost:3000
```

- Sign up at `/signup` → a row appears in Supabase → **Authentication → Users**.
- Add a transaction → a row appears in **Table Editor → transactions**
  (scoped to your user via RLS).
- "Try the demo" still works with no account (data stays in your browser).

## How it fits together

- `src/lib/supabase/{client,server,middleware}.ts` — Supabase clients for the
  browser, server components/actions, and the session-refreshing middleware.
- `src/app/auth-actions.ts` — `signUp` / `login` / `loginWithGoogle` / `logout`.
- `src/app/auth/callback/route.ts` — OAuth / email-confirmation code exchange.
- `src/app/actions.ts` — transaction CRUD against the `transactions` table
  (RLS enforces ownership; the server client carries the user's session).
- `src/middleware.ts` — gates `/dashboard`, `/transactions`, `/reports`,
  `/recurring`; demo visitors (`ft_demo` cookie) are allowed through.

> Security: only the **publishable/anon** key is used. RLS is what protects the
> data — never ship the `service_role` / secret key to the browser.

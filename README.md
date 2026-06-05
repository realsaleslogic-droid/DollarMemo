# FlowTrack — Premium Personal Finance Dashboard

A fully-functional, investor-ready personal finance web app demo. FlowTrack
looks and behaves like a real fintech platform — tracking income & expenses,
analyzing spending, managing recurring subscriptions, and generating
statements — all powered by **realistic seeded demo data** (no bank
integration required).

> Design language inspired by a premium teal/emerald fintech aesthetic:
> glassmorphism, smooth animations, professional charts, dark mode, and subtle
> 3D finance visuals. Responsive for desktop **and** mobile.

## ✨ Tech stack

| Layer       | Tech                                              |
| ----------- | ------------------------------------------------- |
| Framework   | **Next.js 14** (App Router) + **React 18**        |
| Language    | **TypeScript**                                    |
| Styling     | **Tailwind CSS** (custom design system)           |
| Auth + DB   | **Supabase** (Auth + Postgres with RLS) via `@supabase/ssr` |
| State       | **Zustand** (client store, hydrated from server)  |
| Charts      | **Recharts**                                      |
| 3D          | **React Three Fiber** + **drei** + **three.js**   |
| Animation   | **Framer Motion**                                 |
| Exports     | **jsPDF** + **jspdf-autotable** (PDF), native CSV |
| Icons/Theme | **lucide-react**, **next-themes**                 |

## 🚀 Getting started

FlowTrack uses **Supabase** for auth + database. Full setup (env, the one-time
`transactions` table SQL, auth settings) is in **[SUPABASE.md](./SUPABASE.md)**.

```bash
npm install
# set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env
# run supabase/sql/transactions.sql in the Supabase SQL Editor (one time)
npm run dev            # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

## 🔐 Accounts & demo mode

- **Accounts** — **Supabase Auth** (email + password, and Google if enabled in
  Supabase). Sign up at `/signup`, log in at `/login`. Users live in Supabase
  (`auth.users`); new accounts start empty. Only the **public anon/publishable**
  key is used in the app — no DB password or service key.
- **Try the demo** — "Try the demo" on the landing page enters the app with no
  account. Demo data is sample transactions stored **only in the browser**
  (localStorage); nothing touches Supabase. A signed-out visitor is gated to the
  demo by the `ft_demo` cookie; otherwise app routes redirect to `/login`.
- **Data isolation** — transactions live in a `transactions` table with
  **Postgres Row-Level Security**: every row is keyed to `auth.uid()`, so a user
  can only ever read/write their own data.

## 🗺️ Pages

- **/** — Landing / onboarding ("Spend smarter. Save more.") with a 3D hero.
- **/dashboard** — Monthly Income / Spending / Net Cash Flow with Today / Week /
  Month / Year switching; spending-by-category pie; spending-trend bar chart
  (Daily / Weekly / Monthly); recent activity with Add / View All.
- **/transactions** — Full history with search + filters (type, category,
  month, year), grouped-by-day list, summary totals, CSV export, add / edit /
  delete.
- **/reports** — Auto-generated insights (top category, largest transaction,
  avg. daily spend, subscription spend, income & spending trends), income vs
  expenses, monthly spending, category analysis, and **CSV + PDF statement**
  export.
- **/recurring** — Auto-detected subscriptions & bills as cards (monthly /
  annual cost, frequency, next billing date) plus subscription analytics.
- **/accounts** — Link real banks & credit cards via **Plaid**; transactions
  sync in, get categorized, and flow through every view. Setup in
  **[PLAID.md](./PLAID.md)**.

## 🏗️ Architecture

```
src/
├── middleware.ts              # Supabase session refresh + route gating
├── app/
│   ├── layout.tsx              # Root layout, fonts, theme provider
│   ├── page.tsx                # Landing / onboarding (Sign up / Log in / Demo)
│   ├── actions.ts              # Transaction CRUD (Supabase, RLS-scoped)
│   ├── auth-actions.ts         # signUp / login / loginWithGoogle / logout
│   ├── auth/callback/route.ts  # OAuth / email-confirm code exchange
│   ├── (auth)/login,signup     # Auth pages
│   └── (app)/                  # Authenticated app shell (sidebar + bottom nav)
│       ├── layout.tsx          # Loads the user + transactions, hydrates store
│       └── dashboard | transactions | reports | recurring
├── components/                 # charts/, three/, auth/, UI, TransactionModal…
├── lib/
│   ├── supabase/{client,server,middleware}.ts   # Supabase clients
│   ├── analytics.ts            # All financial calculations
│   ├── export.ts               # CSV + PDF generation
│   ├── transactionRow.ts       # DB row <-> app type mapping
│   └── categories.ts / format.ts / types.ts / sampleData.ts …
└── store/
    ├── useFinanceStore.ts      # Transactions + mutations (db vs demo mode)
    ├── useSessionStore.ts      # Current user + mode (for UI)
    └── useUIStore.ts           # Modal state
supabase/
├── config.toml                 # Supabase CLI config
└── sql/transactions.sql        # transactions table + RLS (run once)
```

## 🧮 Data & calculations

Everything is computed live from the stored transactions: monthly spending /
income / net cash flow, category breakdowns, daily/weekly/monthly trends,
historical % comparisons, recurring-payment detection, and report insights.
Signed-in mutations persist to Supabase via **server actions** (RLS-scoped) and
update the client store instantly; demo mutations stay in `localStorage`.

---

*The "Try the demo" experience uses randomly generated sample data stored only
in your browser. Signed-in accounts and their data live in your Supabase
project.*

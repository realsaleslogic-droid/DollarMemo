-- DollarMemo — Stripe Financial Connections schema.
-- Run this once in Supabase -> SQL Editor (after transactions.sql).
--
-- Linked-account references (fca_...) and the user's Stripe customer id are
-- stored in tables only the server's service-role key can read. Transactions are
-- fetched with the Stripe secret key server-side; the stored ids are not user
-- credentials, but we keep these tables service-role-only for safety.

-- Maps a DollarMemo user to their Stripe customer (account_holder for sessions).
create table if not exists public.stripe_customers (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  customer_id text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.stripe_customers enable row level security;
revoke all on public.stripe_customers from anon, authenticated;

-- One row per linked Financial Connections account.
create table if not exists public.stripe_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  account_id       text not null unique,             -- Stripe FC account id (fca_...)
  institution_name text,
  last4            text,
  display_name     text,
  status           text not null default 'active',   -- active | error | disconnected
  error            text,
  last_synced_at   timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists stripe_accounts_user_id_idx on public.stripe_accounts (user_id);

alter table public.stripe_accounts enable row level security;
revoke all on public.stripe_accounts from anon, authenticated;

-- Synced-transaction columns + idempotent de-dup (safe to re-run).
alter table public.transactions
  add column if not exists source      text not null default 'manual',  -- manual | stripe
  add column if not exists external_id text,                            -- stripe transaction id
  add column if not exists account_id  text,                            -- stripe account id
  add column if not exists pending     boolean not null default false;

create unique index if not exists transactions_user_external_uidx
  on public.transactions (user_id, external_id);

-- FlowTrack — Plaid bank/card sync schema.
-- Run this once in Supabase -> SQL Editor (after transactions.sql).
--
-- Security model: `plaid_items` stores bank ACCESS TOKENS, which must never be
-- readable by the browser. RLS is enabled with NO policies for the anon/auth
-- roles, so the table is unreachable with the publishable key. The server reads
-- and writes it only with the service-role key (which bypasses RLS). Tokens are
-- additionally encrypted at rest by the app (see src/lib/plaid/crypto.ts).

-- One row per linked institution (a Plaid "item").
create table if not exists public.plaid_items (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  item_id            text not null unique,
  access_token       text not null,          -- encrypted ciphertext, never plaintext
  institution_id     text,
  institution_name   text,
  cursor             text,                    -- transactions/sync pagination cursor
  status             text not null default 'active',  -- active | error | revoked
  error              text,
  last_synced_at     timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists plaid_items_user_id_idx on public.plaid_items (user_id);

-- RLS on, but intentionally NO anon/authenticated policies: only the
-- service-role server client may touch this table.
alter table public.plaid_items enable row level security;
revoke all on public.plaid_items from anon, authenticated;

-- Extend transactions for synced rows: provenance + idempotent de-duplication.
alter table public.transactions
  add column if not exists source        text not null default 'manual',  -- manual | plaid
  add column if not exists external_id   text,                            -- plaid transaction_id
  add column if not exists account_id    text,                            -- plaid account_id
  add column if not exists pending       boolean not null default false;

-- A Plaid transaction is unique per user; this makes re-sync an upsert, not a
-- duplicate. NULL external_id values are distinct in a unique index, so manual
-- rows (external_id IS NULL) are unaffected and the ON CONFLICT target is
-- inferable by PostgREST upserts.
create unique index if not exists transactions_user_external_uidx
  on public.transactions (user_id, external_id);

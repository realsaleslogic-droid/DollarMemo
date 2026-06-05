-- FlowTrack — transactions table + row-level security.
-- Run this once in Supabase → SQL Editor (accounts are handled by Supabase Auth,
-- so no users table is needed here).

create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  date         timestamptz not null,
  merchant     text not null,
  category     text not null,
  amount       double precision not null,
  type         text not null check (type in ('income', 'expense')),
  description  text,
  is_recurring boolean not null default false,
  recurring_id text,
  frequency    text,
  created_at   timestamptz not null default now()
);

create index if not exists transactions_user_id_idx   on public.transactions (user_id);
create index if not exists transactions_user_date_idx  on public.transactions (user_id, date);
create index if not exists transactions_user_cat_idx   on public.transactions (user_id, category);

-- Row-level security: each user can only see/modify their own rows.
alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
drop policy if exists "transactions_insert_own" on public.transactions;
drop policy if exists "transactions_update_own" on public.transactions;
drop policy if exists "transactions_delete_own" on public.transactions;

create policy "transactions_select_own" on public.transactions
  for select using (auth.uid() = user_id);

create policy "transactions_insert_own" on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "transactions_update_own" on public.transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_delete_own" on public.transactions
  for delete using (auth.uid() = user_id);

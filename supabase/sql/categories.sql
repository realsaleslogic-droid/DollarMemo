-- DollarMemo — learned merchant categories.
-- Run once in Supabase -> SQL Editor (after stripe.sql).
--
-- Remembers a category per (user, merchant) so categorization improves over
-- time. `source` = 'user' (a manual correction, highest priority) or 'auto'
-- (cached automatic result, e.g. from the optional LLM categorizer).

create table if not exists public.merchant_categories (
  user_id      uuid not null references auth.users (id) on delete cascade,
  merchant_key text not null,                 -- normalized merchant
  category     text not null,
  source       text not null default 'auto',  -- user | auto
  updated_at   timestamptz not null default now(),
  primary key (user_id, merchant_key)
);

create index if not exists merchant_categories_user_idx on public.merchant_categories (user_id);

-- Row-level security: each user owns their own rules. (The sync uses the
-- service-role client, which bypasses RLS, to read/cache rules.)
alter table public.merchant_categories enable row level security;

drop policy if exists "merchant_categories_select_own" on public.merchant_categories;
drop policy if exists "merchant_categories_insert_own" on public.merchant_categories;
drop policy if exists "merchant_categories_update_own" on public.merchant_categories;
drop policy if exists "merchant_categories_delete_own" on public.merchant_categories;

create policy "merchant_categories_select_own" on public.merchant_categories
  for select using (auth.uid() = user_id);
create policy "merchant_categories_insert_own" on public.merchant_categories
  for insert with check (auth.uid() = user_id);
create policy "merchant_categories_update_own" on public.merchant_categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "merchant_categories_delete_own" on public.merchant_categories
  for delete using (auth.uid() = user_id);

-- DollarMemo — billing / subscription columns.
-- Run once in Supabase -> SQL Editor (after stripe.sql).
--
-- Subscription state lives on the existing stripe_customers row (service-role
-- only). 'plan' is derived from subscription_status; we cache it for convenience.

alter table public.stripe_customers
  add column if not exists subscription_id     text,
  add column if not exists subscription_status text,          -- active | trialing | past_due | canceled | ...
  add column if not exists current_period_end  timestamptz,
  add column if not exists updated_at           timestamptz not null default now();

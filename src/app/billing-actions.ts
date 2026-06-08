'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripeClient } from '@/lib/stripe/client';
import { assertStripeConfigured } from '@/lib/stripe/config';
import { getOrCreateCustomer } from '@/lib/stripe/customer';
import { PRICES, planFromStatus, accountLimit, subscriptionPeriodEnd, type Plan } from '@/lib/stripe/plan';

function origin(): string {
  const h = headers();
  return h.get('origin') ?? `https://${h.get('host')}`;
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

/** Start a Stripe Checkout session for a Pro plan; returns the redirect URL. */
export async function createCheckoutSession(plan: 'monthly' | 'annual'): Promise<{ url: string }> {
  assertStripeConfigured();
  const user = await requireUser();
  const customer = await getOrCreateCustomer(user);
  const price = PRICES[plan];

  const session = await stripeClient().checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: { name: `DollarMemo ${price.label}` },
          unit_amount: price.amount,
          recurring: { interval: price.interval },
        },
      },
    ],
    allow_promotion_codes: true,
    success_url: `${origin()}/upgrade?status=success`,
    cancel_url: `${origin()}/upgrade?status=cancel`,
  });
  if (!session.url) throw new Error('Could not start checkout.');
  return { url: session.url };
}

/** Open the Stripe customer portal to manage/cancel the subscription. */
export async function createBillingPortalSession(): Promise<{ url: string }> {
  assertStripeConfigured();
  const user = await requireUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', user.id)
    .single();
  if (!data?.customer_id) throw new Error('No billing account yet.');
  const session = await stripeClient().billingPortal.sessions.create({
    customer: data.customer_id as string,
    return_url: `${origin()}/settings`,
  });
  return { url: session.url };
}

export interface PlanInfo {
  plan: Plan;
  status: string | null;
  limit: number;
  accounts: number;
  hasCustomer: boolean;
}

/** Current plan, account usage, and limit for the signed-in user. */
export async function getPlan(): Promise<PlanInfo> {
  const user = await requireUser();
  const admin = createAdminClient();
  const { data: cust } = await admin
    .from('stripe_customers')
    .select('customer_id, subscription_status')
    .eq('user_id', user.id)
    .single();
  const plan = planFromStatus(cust?.subscription_status as string | null | undefined);
  const { count } = await admin
    .from('stripe_accounts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);
  return {
    plan,
    status: (cust?.subscription_status as string | null) ?? null,
    limit: accountLimit(plan),
    accounts: count ?? 0,
    hasCustomer: Boolean(cust?.customer_id),
  };
}

/** Pull the latest subscription from Stripe and store it (covers webhook lag). */
export async function refreshSubscription(): Promise<void> {
  assertStripeConfigured();
  const user = await requireUser();
  const admin = createAdminClient();
  const { data } = await admin
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', user.id)
    .single();
  if (!data?.customer_id) return;

  const subs = await stripeClient().subscriptions.list({
    customer: data.customer_id as string,
    status: 'all',
    limit: 1,
  });
  const sub = subs.data[0];
  await admin
    .from('stripe_customers')
    .update({
      subscription_id: sub?.id ?? null,
      subscription_status: sub?.status ?? null,
      current_period_end: subscriptionPeriodEnd(sub),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);
}

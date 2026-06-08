import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

export type Plan = 'free' | 'pro';

/** Period end as ISO — Stripe moved this onto subscription items in newer APIs. */
export function subscriptionPeriodEnd(sub: Stripe.Subscription | null | undefined): string | null {
  if (!sub) return null;
  type WithPeriod = { current_period_end?: number };
  const unix =
    (sub.items?.data?.[0] as WithPeriod | undefined)?.current_period_end ??
    (sub as unknown as WithPeriod).current_period_end;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

// Connected-account limits per plan.
export const ACCOUNT_LIMITS: Record<Plan, number> = { free: 1, pro: 5 };

// Pricing, defined in code (cents) so no Stripe Price IDs are needed — edit here
// to change prices.
export const PRICES = {
  monthly: { amount: 799, interval: 'month' as const, label: 'Pro Monthly' },
  annual: { amount: 5999, interval: 'year' as const, label: 'Pro Annual' },
};

/** A subscription in any of these states grants Pro (past_due keeps access during retries). */
export function planFromStatus(status?: string | null): Plan {
  return status === 'active' || status === 'trialing' || status === 'past_due' ? 'pro' : 'free';
}

export function accountLimit(plan: Plan): number {
  return ACCOUNT_LIMITS[plan];
}

/** Read the user's current plan from their stored subscription status. */
export async function getUserPlan(admin: SupabaseClient, userId: string): Promise<Plan> {
  const { data } = await admin
    .from('stripe_customers')
    .select('subscription_status')
    .eq('user_id', userId)
    .single();
  return planFromStatus(data?.subscription_status as string | null | undefined);
}

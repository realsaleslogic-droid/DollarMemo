import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripeClient } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { isStripeConfigured } from '@/lib/stripe/config';
import { subscriptionPeriodEnd } from '@/lib/stripe/plan';

// Receives Stripe Billing events and mirrors subscription status onto the
// stripe_customers row (which drives the user's plan). Set the endpoint to
// /api/stripe/webhook in the Stripe Dashboard and put the signing secret in
// STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(body, sig ?? '', secret);
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad_signature' }, { status: 400 });
  }

  const admin = createAdminClient();
  const writeSub = (customer: string, sub: Stripe.Subscription | null) =>
    admin
      .from('stripe_customers')
      .update({
        subscription_id: sub?.id ?? null,
        subscription_status: sub?.status ?? 'canceled',
        current_period_end: subscriptionPeriodEnd(sub),
        updated_at: new Date().toISOString(),
      })
      .eq('customer_id', customer);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.subscription && s.customer) {
          const sub = await stripeClient().subscriptions.retrieve(s.subscription as string);
          await writeSub(s.customer as string, sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await writeSub(sub.customer as string, sub);
        break;
      }
      default:
        break;
    }
  } catch {
    // Don't make Stripe retry forever on a transient write issue we can't fix here.
  }

  return NextResponse.json({ received: true });
}

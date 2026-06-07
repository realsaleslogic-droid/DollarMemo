import 'server-only';
import Stripe from 'stripe';

// Server-side Stripe client, created lazily so importing this never throws when
// Stripe is unconfigured (call sites gate on isStripeConfigured()).
let cached: Stripe | null = null;

export function stripeClient(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set.');
  cached = new Stripe(key, { appInfo: { name: 'DollarMemo' } });
  return cached;
}

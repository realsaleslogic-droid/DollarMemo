// Stripe configuration (server-side). Bank linking uses Stripe Financial
// Connections. Importing this is safe without keys — gate behavior on
// isStripeConfigured().

import 'server-only';

/** True only when every secret needed to talk to Stripe + store links is set. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function assertStripeConfigured(): void {
  if (!isStripeConfigured()) {
    throw new Error(
      'Bank sync is not configured. Set STRIPE_SECRET_KEY, ' +
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY. See STRIPE.md.'
    );
  }
}

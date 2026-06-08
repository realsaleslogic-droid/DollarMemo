import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripeClient } from './client';

/** Get (or lazily create) the Stripe customer for a user, stored in stripe_customers. */
export async function getOrCreateCustomer(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('stripe_customers')
    .select('customer_id')
    .eq('user_id', user.id)
    .single();
  if (data?.customer_id) return data.customer_id as string;

  const customer = await stripeClient().customers.create({
    email: user.email ?? undefined,
    name: (user.user_metadata?.name as string | undefined) ?? undefined,
    metadata: { supabase_user_id: user.id },
  });
  await admin.from('stripe_customers').insert({ user_id: user.id, customer_id: customer.id });
  return customer.id;
}

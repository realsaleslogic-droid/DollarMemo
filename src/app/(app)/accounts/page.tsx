import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Topbar from '@/components/Topbar';
import AccountsClient from '@/components/accounts/AccountsClient';
import { createClient } from '@/lib/supabase/server';
import { isStripeConfigured } from '@/lib/stripe/config';
import { listConnections, type Connection } from '@/app/stripe-actions';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Bank linking needs a real account to attach data to — demo mode can't link.
  if (!user) {
    return (
      <>
        <Topbar title="Accounts" subtitle="Linked banks & cards" />
        <div className="card flex flex-col items-start gap-3 p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Sparkles size={20} />
          </span>
          <h3 className="text-lg font-bold">Create an account to link your bank</h3>
          <p className="max-w-md text-sm text-ink-soft">
            You&apos;re in demo mode. Connecting a real bank or card requires a free DollarMemo account so your
            transactions can sync securely to your profile.
          </p>
          <Link
            href="/signup"
            className="mt-1 inline-flex rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
          >
            Create free account →
          </Link>
        </div>
      </>
    );
  }

  const configured = isStripeConfigured();
  let connections: Connection[] = [];
  if (configured) {
    try {
      connections = await listConnections();
    } catch {
      connections = [];
    }
  }

  return (
    <>
      <Topbar title="Accounts" subtitle="Linked banks & cards" />
      <AccountsClient configured={configured} initialConnections={connections} />
    </>
  );
}

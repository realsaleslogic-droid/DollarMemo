import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Topbar from '@/components/Topbar';
import UpgradeClient from '@/components/billing/UpgradeClient';
import { createClient } from '@/lib/supabase/server';
import { PRICES, ACCOUNT_LIMITS } from '@/lib/stripe/plan';
import { getPlan, type PlanInfo } from '@/app/billing-actions';

export const dynamic = 'force-dynamic';

export default async function UpgradePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Topbar title="Upgrade" subtitle="Unlock multiple bank connections" />
        <div className="card flex flex-col items-start gap-3 p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
            <Sparkles size={20} />
          </span>
          <h3 className="text-lg font-bold">Create an account to upgrade</h3>
          <p className="max-w-md text-sm text-ink-soft">
            Plans are tied to your DollarMemo account. Sign up free to connect a bank, then upgrade to Pro anytime.
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

  let plan: PlanInfo;
  try {
    plan = await getPlan();
  } catch {
    plan = { plan: 'free', status: null, limit: ACCOUNT_LIMITS.free, accounts: 0, hasCustomer: false };
  }

  return (
    <>
      <Topbar title="Upgrade" subtitle="Unlock multiple bank connections" />
      <UpgradeClient
        plan={plan}
        prices={{ monthly: PRICES.monthly.amount, annual: PRICES.annual.amount }}
        proLimit={ACCOUNT_LIMITS.pro}
      />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Sparkles, CreditCard, CheckCircle2 } from 'lucide-react';
import {
  createCheckoutSession,
  createBillingPortalSession,
  refreshSubscription,
  type PlanInfo,
} from '@/app/billing-actions';
import { cn } from '@/lib/utils';

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

const PRO_FEATURES = [
  'Connect up to 5 banks & cards',
  'Automatic transaction sync',
  'Auto-categorization & merchant logos',
  'Recurring payment calendar',
  'CSV & PDF statements',
];

export default function UpgradeClient({
  plan,
  prices,
  proLimit,
}: {
  plan: PlanInfo;
  prices: { monthly: number; annual: number };
  proLimit: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('annual');
  const [busy, setBusy] = useState<string | null>(null);
  const [upgraded, setUpgraded] = useState(false);

  // Returning from Checkout: reconcile the subscription (the webhook may lag).
  useEffect(() => {
    if (params.get('status') === 'success') {
      refreshSubscription()
        .then(() => {
          setUpgraded(true);
          router.refresh();
        })
        .catch(() => {});
    }
  }, [params, router]);

  const isPro = plan.plan === 'pro';
  const annualPerMonth = prices.annual / 12;
  const savePct = Math.round((1 - prices.annual / (prices.monthly * 12)) * 100);

  async function checkout(p: 'monthly' | 'annual') {
    setBusy(p);
    try {
      const { url } = await createCheckoutSession(p);
      window.location.href = url;
    } catch (e) {
      setBusy(null);
      alert(e instanceof Error ? e.message : 'Could not start checkout.');
    }
  }

  async function manage() {
    setBusy('manage');
    try {
      const { url } = await createBillingPortalSession();
      window.location.href = url;
    } catch {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {(upgraded || (isPro && params.get('status') === 'success')) && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-income/10 px-4 py-3 text-sm font-semibold text-income">
          <CheckCircle2 size={18} /> You&apos;re on Pro — connect up to {proLimit} accounts now.
        </div>
      )}

      {/* Current plan / billing toggle */}
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <span className="stat-pill gap-1.5 bg-brand-500/10 text-brand-700 dark:text-brand-300">
          <Sparkles size={13} /> {isPro ? 'You’re on Pro' : 'Free plan'} · {plan.accounts}/{plan.limit} accounts used
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Connect more of your money</h2>
        <p className="max-w-md text-ink-soft">
          Free includes one bank. Upgrade to Pro to securely connect and sync up to {proLimit} banks &amp; cards.
        </p>

        {!isPro && (
          <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1">
            {(['monthly', 'annual'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setInterval(opt)}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-semibold transition',
                  interval === opt ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'
                )}
              >
                {opt === 'monthly' ? 'Monthly' : `Annual · save ${savePct}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className="card p-6">
          <h3 className="font-bold">Free</h3>
          <p className="mt-1 text-3xl font-extrabold tracking-tight">$0</p>
          <p className="text-xs text-ink-soft">forever</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2"><Check size={15} className="text-ink-soft" /> 1 connected bank</li>
            <li className="flex items-center gap-2"><Check size={15} className="text-ink-soft" /> Auto-sync & categorize</li>
            <li className="flex items-center gap-2"><Check size={15} className="text-ink-soft" /> Dashboard, reports & recurring</li>
          </ul>
          <div className="mt-6 rounded-xl border border-line py-2.5 text-center text-sm font-semibold text-ink-soft">
            {isPro ? 'Included' : 'Your current plan'}
          </div>
        </div>

        {/* Pro */}
        <div className="card relative overflow-hidden border-brand-400/40 p-6 ring-1 ring-brand-400/30">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/15 blur-2xl" />
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Pro</h3>
            <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              Most popular
            </span>
          </div>

          {interval === 'annual' && !isPro ? (
            <>
              <p className="mt-1 text-3xl font-extrabold tracking-tight">
                {money(annualPerMonth)}
                <span className="text-base font-semibold text-ink-soft">/mo</span>
              </p>
              <p className="text-xs text-ink-soft">{money(prices.annual)} billed yearly · save {savePct}%</p>
            </>
          ) : (
            <>
              <p className="mt-1 text-3xl font-extrabold tracking-tight">
                {money(prices.monthly)}
                <span className="text-base font-semibold text-ink-soft">/mo</span>
              </p>
              <p className="text-xs text-ink-soft">billed monthly</p>
            </>
          )}

          <ul className="mt-4 space-y-2 text-sm">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check size={15} className="text-brand-600 dark:text-brand-300" /> {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <button
              onClick={manage}
              disabled={busy === 'manage'}
              className="btn-ghost mt-6 w-full justify-center"
            >
              {busy === 'manage' ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />} Manage
              billing
            </button>
          ) : (
            <button
              onClick={() => checkout(interval)}
              disabled={busy !== null}
              className="btn-primary mt-6 w-full justify-center"
            >
              {busy === interval ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-ink-soft">
        Secure checkout by Stripe · cancel anytime{isPro ? ' from Manage billing' : ''}.
      </p>
    </div>
  );
}

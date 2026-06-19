'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Landmark, RefreshCw, Trash2, ShieldCheck, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import ConnectBankButton from './ConnectBankButton';
import { BankTrustBadge } from '@/components/BankTrust';
import { listConnections, syncTransactions, removeConnection, type Connection } from '@/app/stripe-actions';
import type { PlanInfo } from '@/app/billing-actions';
import { formatDate } from '@/lib/format';

export default function AccountsClient({
  configured,
  initialConnections,
  plan,
}: {
  configured: boolean;
  initialConnections: Connection[];
  plan: PlanInfo | null;
}) {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [syncing, setSyncing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const limit = plan?.limit ?? 1;
  const atLimit = !!plan && connections.length >= plan.limit;

  async function refresh() {
    try {
      setConnections(await listConnections());
    } catch {
      /* ignore — UI keeps prior list */
    }
    router.refresh();
  }

  async function handleSync() {
    setSyncing(true);
    setMessage(null);
    try {
      const r = await syncTransactions();
      setMessage(r.added > 0 ? `Synced ${r.added} transaction${r.added === 1 ? '' : 's'}.` : 'Up to date — no new transactions.');
      await refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeConnection(id);
      await refresh();
    } catch {
      /* ignore */
    } finally {
      setRemovingId(null);
    }
  }

  if (!configured) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/15 text-amber-600">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h3 className="font-bold">Bank sync isn&apos;t configured yet</h3>
            <p className="text-sm text-ink-soft">
              Add your Stripe + Supabase service-role keys to enable connecting real accounts.
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-soft">
          See <span className="font-semibold text-ink">STRIPE.md</span> for the setup steps (env vars and the one-time
          <span className="font-semibold text-ink"> supabase/sql/stripe.sql</span> migration).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
            <Landmark size={20} />
          </span>
          <div>
            <h3 className="font-bold">Connect your accounts</h3>
            <p className="text-sm text-ink-soft">
              Securely link a bank with Stripe. Transactions sync in automatically and get categorized.
            </p>
            {plan && (
              <p className="mt-1 text-xs font-medium text-ink-soft">
                {connections.length} of {limit} accounts used
                {plan.plan === 'free' && (
                  <>
                    {' · '}
                    <Link href="/upgrade" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                      Upgrade to Pro →
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          {connections.length > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink transition hover:bg-surface-2 disabled:opacity-60"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
          )}
          {atLimit ? (
            <Link
              href="/upgrade"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
            >
              <Sparkles size={17} /> Upgrade to connect more
            </Link>
          ) : (
            <ConnectBankButton onLinked={refresh} withSecurityNote />
          )}
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-500/10 px-4 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-300">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {connections.length === 0 ? (
        <div className="card grid place-items-center gap-2 p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-ink-soft">
            <Landmark size={26} />
          </span>
          <p className="font-semibold">No accounts linked yet</p>
          <p className="max-w-sm text-sm text-ink-soft">
            Connect a bank to pull in real transactions and let DollarMemo track and categorize your spending.
          </p>
          <BankTrustBadge className="mt-3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {connections.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card flex items-center justify-between p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
                  <Landmark size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {c.institutionName ?? 'Linked institution'}
                    {c.last4 ? <span className="text-ink-soft"> ···· {c.last4}</span> : null}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                    {c.status === 'error' ? (
                      <>
                        <AlertTriangle size={12} className="text-expense" /> Needs attention
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={12} className="text-income" />
                        {c.lastSyncedAt
                          ? `Synced ${formatDate(c.lastSyncedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
                          : 'Connected'}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(c.id)}
                disabled={removingId === c.id}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-2 hover:text-expense disabled:opacity-50"
                aria-label="Unlink account"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <p className="flex items-center gap-2 px-1 text-xs text-ink-soft">
        <ShieldCheck size={14} className="shrink-0 text-income" />
        Bank credentials are handled by Stripe and never touch DollarMemo. We store only a reference to each linked
        account, used server-side to sync transactions.
      </p>
    </div>
  );
}

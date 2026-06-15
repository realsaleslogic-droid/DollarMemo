'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Repeat, Wallet, Layers } from 'lucide-react';
import Topbar from '@/components/Topbar';
import MerchantAvatar from '@/components/MerchantAvatar';
import RecurringCalendar from '@/components/recurring/RecurringCalendar';
import UpcomingCharges from '@/components/recurring/UpcomingCharges';
import { useReady } from '@/lib/useReady';
import { useSessionStore } from '@/store/useSessionStore';
import { detectSubscriptions, type Subscription } from '@/lib/analytics';
import { getRecurringData } from '@/app/overview-actions';
import { formatMoney, formatDate } from '@/lib/format';
import { categoryLabel } from '@/lib/categories';

export default function RecurringPage() {
  const { transactions, ready } = useReady();
  const mode = useSessionStore((s) => s.mode);

  // Detected over full history server-side for signed-in users; demo / any error
  // falls back to the identical client detection below.
  const [server, setServer] = useState<Subscription[] | null>(null);
  useEffect(() => {
    if (mode !== 'db') {
      setServer(null);
      return;
    }
    let cancelled = false;
    getRecurringData()
      .then((d) => {
        if (!cancelled) setServer(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mode, transactions.length]);

  const { subs, monthlyTotal, yearlyTotal } = useMemo(() => {
    const all = server ?? detectSubscriptions(transactions);
    const monthlyTotal = all.reduce((s, x) => s + x.monthlyCost, 0);
    return { subs: all, monthlyTotal, yearlyTotal: all.reduce((s, x) => s + x.annualCost, 0) };
  }, [transactions, server]);

  const stats = [
    { icon: Wallet, label: 'Total monthly', value: formatMoney(monthlyTotal) },
    { icon: CalendarClock, label: 'Total yearly', value: formatMoney(yearlyTotal) },
    { icon: Layers, label: 'Active recurring', value: String(subs.length) },
    {
      icon: Repeat,
      label: 'Avg. per service',
      value: formatMoney(subs.length ? monthlyTotal / subs.length : 0),
    },
  ];

  return (
    <>
      <Topbar title="Recurring" subtitle="Subscriptions & bills on autopilot" />

      {/* Analytics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) =>
          ready ? (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card p-4"
            >
              <div className="flex items-center gap-2 text-ink-soft">
                <s.icon size={16} />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tracking-tight tabular-nums">{s.value}</p>
            </motion.div>
          ) : (
            <div key={i} className="skeleton h-24" />
          )
        )}
      </div>

      {/* Calendar + upcoming charges */}
      {ready && subs.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RecurringCalendar subs={subs} className="lg:col-span-2" />
          <UpcomingCharges subs={subs} />
        </div>
      )}

      {/* Recurring payments (subscriptions + bills together) */}
      <h2 className="mb-3 mt-6 text-lg font-bold">Recurring Payments</h2>
      {ready ? (
        <SubscriptionGrid subscriptions={subs} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      )}
    </>
  );
}

function SubscriptionGrid({ subscriptions }: { subscriptions: Subscription[] }) {
  if (!subscriptions.length) {
    return <p className="card p-6 text-center text-sm text-ink-soft">No recurring payments detected.</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((s, i) => (
        <SubscriptionCard key={s.recurringId} sub={s} index={i} />
      ))}
    </div>
  );
}

function SubscriptionCard({ sub, index }: { sub: Subscription; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="card group relative overflow-hidden p-5"
    >
      {/* glow accent */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/10 blur-2xl transition group-hover:bg-brand-500/20" />

      <div className="flex items-start justify-between">
        <MerchantAvatar merchant={sub.name} category={sub.category} className="h-12 w-12" size={22} />
        <span className="stat-pill bg-brand-500/10 capitalize text-brand-700 dark:text-brand-300">{sub.frequency}</span>
      </div>

      <h3 className="mt-4 text-lg font-bold">{sub.name}</h3>
      <p className="text-xs text-ink-soft">{categoryLabel(sub.category)}</p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-extrabold tracking-tight tabular-nums">{formatMoney(sub.monthlyCost)}</p>
          <p className="text-xs text-ink-soft">per month</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums text-ink-soft">{formatMoney(sub.annualCost)}</p>
          <p className="text-xs text-ink-soft">per year</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-soft">
        <CalendarClock size={14} />
        Next billing · <span className="font-semibold text-ink">{formatDate(sub.nextBilling, { month: 'short', day: 'numeric' })}</span>
      </div>
    </motion.div>
  );
}

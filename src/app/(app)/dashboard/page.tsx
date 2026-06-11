'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, Plus } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatCard from '@/components/StatCard';
import AuroraBackground from '@/components/dashboard/AuroraBackground';
import Segmented from '@/components/Segmented';
import TransactionRow from '@/components/TransactionRow';
import CategoryPie from '@/components/charts/CategoryPie';
import TrendChart from '@/components/charts/TrendChart';
import BankControl from '@/components/accounts/BankControl';
import { StatGridSkeleton, ListSkeleton } from '@/components/Skeletons';
import { useReady } from '@/lib/useReady';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useUIStore } from '@/store/useUIStore';
import { buildOverviewRanges, aggregateOverview, type DashboardData } from '@/lib/analytics';
import { getDashboardData } from '@/app/overview-actions';
import type { Period, Granularity } from '@/lib/types';

const PERIOD_OPTS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];
const GRAN_OPTS: { value: Granularity; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function DashboardPage() {
  const { transactions, ready } = useReady();
  const { period, setPeriod, granularity, setGranularity } = useFinanceStore();
  const mode = useSessionStore((s) => s.mode);
  const openEdit = useUIStore((s) => s.openEdit);
  const openAdd = useUIStore((s) => s.openAdd);
  const removeTransaction = useFinanceStore((s) => s.removeTransaction);

  // Timezone-correct date windows, computed on the client.
  const ranges = useMemo(() => buildOverviewRanges(), []);

  // Signed-in users get the overview computed server-side over their full
  // history; demo (and any server hiccup) falls back to computing locally —
  // identical numbers either way. Refetch when the data changes (e.g. an edit).
  const [serverData, setServerData] = useState<DashboardData | null>(null);
  useEffect(() => {
    if (mode !== 'db') {
      setServerData(null);
      return;
    }
    let cancelled = false;
    getDashboardData(ranges)
      .then((d) => {
        if (!cancelled) setServerData(d);
      })
      .catch(() => {
        /* keep the local fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [mode, ranges, transactions.length]);

  const overview = useMemo(
    () => serverData ?? aggregateOverview(transactions, ranges),
    [serverData, transactions, ranges]
  );

  const data = useMemo(() => {
    const p = overview.periods[period];
    return {
      cur: p,
      deltaIncome: p.deltaIncome,
      deltaExpenses: p.deltaExpenses,
      deltaNet: p.deltaNet,
      byCategory: p.byCategory,
      trend: overview.trend[granularity],
      recent: overview.recent,
    };
  }, [overview, period, granularity]);

  return (
    <>
      <AuroraBackground />
      <Topbar
        title="Dashboard"
        subtitle="Your money at a glance"
        primaryAction={mode === 'db' ? <BankControl /> : undefined}
      />

      {/* Period switcher + add transaction */}
      <div className="mb-5 mt-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold lg:hidden">Overview</h2>
        <div className="ml-auto flex items-center gap-2">
          {mode === 'db' && (
            <button onClick={openAdd} className="btn-primary px-3.5 py-2 text-xs">
              <Plus size={15} /> Add Transaction
            </button>
          )}
          <Segmented options={PERIOD_OPTS} value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* Stat cards */}
      {ready ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label={`Income (${period})`} value={data.cur.income} icon={TrendingUp} accent="income" delta={data.deltaIncome} index={0} />
          <StatCard label={`Spending (${period})`} value={data.cur.expenses} icon={TrendingDown} accent="expense" delta={data.deltaExpenses} index={1} />
          <StatCard label="Net Cash Flow" value={data.cur.net} icon={Wallet} accent="brand" delta={data.deltaNet} index={2} />
        </div>
      ) : (
        <StatGridSkeleton />
      )}

      {/* Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5"
      >
        {/* Category pie */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="mb-1 font-bold">Spending by Category</h3>
          <p className="mb-2 text-xs text-ink-soft">Distribution for the selected period</p>
          {ready ? <CategoryPie data={data.byCategory} /> : <div className="skeleton h-[260px]" />}
          {ready && (
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.byCategory.slice(0, 6).map((c) => (
                <li key={c.category} className="flex items-center gap-2 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="flex-1 truncate text-ink-soft">{c.label}</span>
                  <span className="font-semibold tabular-nums">{c.pct.toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trend */}
        <div className="card p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold">Spending Trend</h3>
              <p className="text-xs text-ink-soft">How your spending moves over time</p>
            </div>
            <Segmented options={GRAN_OPTS} value={granularity} onChange={setGranularity} />
          </div>
          {ready ? <TrendChart data={data.trend} /> : <div className="skeleton h-[280px]" />}
        </div>
      </motion.div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 card p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Recent Activity</h3>
          <div className="flex items-center gap-2">
            <button onClick={openAdd} className="btn-soft py-1.5 text-xs">
              <Plus size={15} /> Add
            </button>
            <Link href="/transactions" className="btn-ghost py-1.5 text-xs">
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        {ready ? (
          <div className="space-y-0.5">
            {data.recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} showActions onEdit={openEdit} onDelete={removeTransaction} />
            ))}
          </div>
        ) : (
          <ListSkeleton rows={5} />
        )}
      </motion.div>
    </>
  );
}

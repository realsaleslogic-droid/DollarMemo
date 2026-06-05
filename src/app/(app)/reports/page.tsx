'use client';

import { useMemo } from 'react';
import { Download, FileText, Crown, Receipt, CalendarDays, Repeat, TrendingUp, TrendingDown } from 'lucide-react';
import Topbar from '@/components/Topbar';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import TrendChart from '@/components/charts/TrendChart';
import { useReady } from '@/lib/useReady';
import {
  monthlyIncomeVsExpenses,
  spendingByCategory,
  spendingTrend,
  largestTransaction,
  averageDailySpending,
  subscriptionServices,
  detectSubscriptions,
  summarize,
  periodRange,
  previousRange,
  filterByRange,
  pctChange,
} from '@/lib/analytics';
import { exportCSV, exportPDF } from '@/lib/export';
import { formatMoney } from '@/lib/format';
import { categoryLabel } from '@/lib/categories';

export default function ReportsPage() {
  const { transactions, ready } = useReady();

  const r = useMemo(() => {
    const byCat = spendingByCategory(transactions);
    const subs = subscriptionServices(transactions);
    const subMonthly = subs.reduce((s, x) => s + x.monthlyCost, 0);
    const largest = largestTransaction(transactions);
    const curMonth = summarize(filterByRange(transactions, periodRange('month')));
    const prevMonth = summarize(filterByRange(transactions, previousRange('month')));
    return {
      ivse: monthlyIncomeVsExpenses(transactions),
      monthlyTrend: spendingTrend(transactions, 'monthly'),
      byCat,
      topCategory: byCat[0],
      largest,
      avgDaily: averageDailySpending(transactions),
      subMonthly,
      subCount: (subs.length ? subs : detectSubscriptions(transactions)).length,
      incomeDelta: pctChange(curMonth.income, prevMonth.income),
      spendDelta: pctChange(curMonth.expenses, prevMonth.expenses),
    };
  }, [transactions]);

  const insights = ready
    ? [
        {
          icon: Crown,
          title: 'Top spending category',
          value: r.topCategory ? categoryLabel(r.topCategory.category) : '—',
          detail: r.topCategory ? `${formatMoney(r.topCategory.total)} · ${r.topCategory.pct.toFixed(0)}% of spend` : 'No data',
        },
        {
          icon: Receipt,
          title: 'Largest transaction',
          value: r.largest ? formatMoney(Math.abs(r.largest.amount)) : '—',
          detail: r.largest ? `${r.largest.merchant}` : 'No data',
        },
        {
          icon: CalendarDays,
          title: 'Avg. daily spending',
          value: formatMoney(r.avgDaily),
          detail: 'This month so far',
        },
        {
          icon: Repeat,
          title: 'Subscription spend',
          value: formatMoney(r.subMonthly),
          detail: `${r.subCount} active · ${formatMoney(r.subMonthly * 12)}/yr`,
        },
        {
          icon: r.incomeDelta >= 0 ? TrendingUp : TrendingDown,
          title: 'Income trend',
          value: `${r.incomeDelta >= 0 ? '+' : ''}${r.incomeDelta.toFixed(1)}%`,
          detail: 'vs last month',
        },
        {
          icon: r.spendDelta <= 0 ? TrendingDown : TrendingUp,
          title: 'Spending trend',
          value: `${r.spendDelta >= 0 ? '+' : ''}${r.spendDelta.toFixed(1)}%`,
          detail: 'vs last month',
        },
      ]
    : [];

  return (
    <>
      <Topbar title="Reports" subtitle="Automated insights from your financial data" />

      {/* Export actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Financial Insights</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV(transactions)} className="btn-ghost py-2 text-xs">
            <Download size={15} /> Download CSV
          </button>
          <button onClick={() => exportPDF(transactions)} className="btn-primary py-2 text-xs">
            <FileText size={15} /> PDF Statement
          </button>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {ready
          ? insights.map((ins) => (
              <div key={ins.title} className="card p-4">
                <div className="flex items-center gap-2 text-ink-soft">
                  <ins.icon size={16} />
                  <span className="text-xs font-medium">{ins.title}</span>
                </div>
                <p className="mt-2 truncate text-xl font-extrabold tracking-tight">{ins.value}</p>
                <p className="truncate text-xs text-ink-soft">{ins.detail}</p>
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24" />)}
      </div>

      {/* Income vs Expenses */}
      <div className="mt-5 card p-5">
        <h3 className="mb-1 font-bold">Income vs Expenses</h3>
        <p className="mb-3 text-xs text-ink-soft">Trailing 12 months</p>
        {ready ? <IncomeExpenseChart data={r.ivse} /> : <div className="skeleton h-[300px]" />}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly spending */}
        <div className="card p-5">
          <h3 className="mb-1 font-bold">Monthly Spending</h3>
          <p className="mb-3 text-xs text-ink-soft">Total expenses per month</p>
          {ready ? <TrendChart data={r.monthlyTrend} /> : <div className="skeleton h-[280px]" />}
        </div>

        {/* Category analysis */}
        <div className="card p-5">
          <h3 className="mb-1 font-bold">Category Analysis</h3>
          <p className="mb-3 text-xs text-ink-soft">Where your money goes (all time)</p>
          {ready ? (
            <div className="space-y-3 py-2">
              {r.byCat.map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{c.label}</span>
                    <span className="font-semibold tabular-nums">{formatMoney(c.total)}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="skeleton h-[280px]" />
          )}
        </div>
      </div>
    </>
  );
}

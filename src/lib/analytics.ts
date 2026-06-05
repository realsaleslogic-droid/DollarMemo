import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  eachMonthOfInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  isWithinInterval,
} from 'date-fns';
import type { Transaction, Period, Granularity } from './types';
import { categoryColor, categoryLabel, EXPENSE_CATEGORIES } from './categories';

// ----------------------------- period ranges ------------------------------

export interface DateRange {
  start: Date;
  end: Date;
}

export function periodRange(period: Period, ref = new Date()): DateRange {
  switch (period) {
    case 'today':
      return { start: startOfDay(ref), end: endOfDay(ref) };
    case 'week':
      return { start: startOfWeek(ref, { weekStartsOn: 1 }), end: endOfWeek(ref, { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(ref), end: endOfMonth(ref) };
    case 'year':
      return { start: startOfYear(ref), end: endOfYear(ref) };
  }
}

/** The equivalent range immediately preceding `period`, for trend comparisons. */
export function previousRange(period: Period, ref = new Date()): DateRange {
  switch (period) {
    case 'today':
      return periodRange('today', subDays(ref, 1));
    case 'week':
      return periodRange('week', subDays(ref, 7));
    case 'month':
      return periodRange('month', subMonths(ref, 1));
    case 'year':
      return periodRange('year', subMonths(ref, 12));
  }
}

export function inRange(t: Transaction, range: DateRange): boolean {
  return isWithinInterval(new Date(t.date), { start: range.start, end: range.end });
}

export function filterByRange(txs: Transaction[], range: DateRange): Transaction[] {
  return txs.filter((t) => inRange(t, range));
}

// ------------------------------ aggregates ---------------------------------

export function totalIncome(txs: Transaction[]): number {
  return txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

/** Returns a positive number representing total spending. */
export function totalExpenses(txs: Transaction[]): number {
  return txs.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
}

export function netCashFlow(txs: Transaction[]): number {
  return txs.reduce((s, t) => s + t.amount, 0);
}

export interface Summary {
  income: number;
  expenses: number;
  net: number;
}

export function summarize(txs: Transaction[]): Summary {
  return { income: totalIncome(txs), expenses: totalExpenses(txs), net: netCashFlow(txs) };
}

/** % change between two values; guards divide-by-zero. */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// --------------------------- category breakdown ----------------------------

export interface CategorySlice {
  category: string;
  label: string;
  total: number;
  color: string;
  pct: number;
}

export function spendingByCategory(txs: Transaction[]): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== 'expense') continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  const grand = [...totals.values()].reduce((s, v) => s + v, 0) || 1;
  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      label: categoryLabel(category),
      total,
      color: categoryColor(category),
      pct: (total / grand) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}

// ------------------------------- trends ------------------------------------

export interface TrendPoint {
  label: string;
  expenses: number;
  income: number;
}

/** Spending/income trend bucketed by granularity over a trailing window. */
export function spendingTrend(
  txs: Transaction[],
  granularity: Granularity,
  ref = new Date()
): TrendPoint[] {
  let buckets: Date[];
  let labelFmt: string;
  let bucketStart: (d: Date) => Date;
  let bucketEnd: (d: Date) => Date;

  if (granularity === 'daily') {
    buckets = eachDayOfInterval({ start: subDays(ref, 13), end: ref });
    labelFmt = 'MMM d';
    bucketStart = startOfDay;
    bucketEnd = endOfDay;
  } else if (granularity === 'weekly') {
    buckets = eachWeekOfInterval({ start: subDays(ref, 7 * 9), end: ref }, { weekStartsOn: 1 });
    labelFmt = 'MMM d';
    bucketStart = (d) => startOfWeek(d, { weekStartsOn: 1 });
    bucketEnd = (d) => endOfWeek(d, { weekStartsOn: 1 });
  } else {
    buckets = eachMonthOfInterval({ start: subMonths(ref, 11), end: ref });
    labelFmt = 'MMM';
    bucketStart = startOfMonth;
    bucketEnd = endOfMonth;
  }

  return buckets.map((b) => {
    const range = { start: bucketStart(b), end: bucketEnd(b) };
    const slice = filterByRange(txs, range);
    return {
      label: format(b, labelFmt),
      expenses: totalExpenses(slice),
      income: totalIncome(slice),
    };
  });
}

/** Income vs expenses for the trailing 12 months (Reports page). */
export function monthlyIncomeVsExpenses(txs: Transaction[], ref = new Date()): TrendPoint[] {
  const months = eachMonthOfInterval({ start: subMonths(ref, 11), end: ref });
  return months.map((m) => {
    const range = { start: startOfMonth(m), end: endOfMonth(m) };
    const slice = filterByRange(txs, range);
    return {
      label: format(m, 'MMM yy'),
      expenses: totalExpenses(slice),
      income: totalIncome(slice),
    };
  });
}

// ------------------------------ recent -------------------------------------

export function recentTransactions(txs: Transaction[], n = 5): Transaction[] {
  return [...txs].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, n);
}

export function largestTransaction(txs: Transaction[]): Transaction | null {
  const expenses = txs.filter((t) => t.type === 'expense');
  if (!expenses.length) return null;
  return expenses.reduce((max, t) => (Math.abs(t.amount) > Math.abs(max.amount) ? t : max));
}

// --------------------------- recurring detection ---------------------------

export interface Subscription {
  recurringId: string;
  name: string;
  category: string;
  monthlyCost: number;
  annualCost: number;
  frequency: string;
  lastCharge: string;
  nextBilling: string;
  occurrences: number;
}

/**
 * Identify recurring subscription-style payments from the data. We group
 * recurring expenses by `recurringId`, take the most recent charge amount, and
 * project the next billing date one month out.
 */
export function detectSubscriptions(txs: Transaction[]): Subscription[] {
  const groups = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (t.type !== 'expense' || !t.isRecurring || !t.recurringId) continue;
    // Treat rent/utilities as bills too, but the Recurring page focuses on
    // subscription-like services; include all recurring expenses and let the
    // UI group them.
    const arr = groups.get(t.recurringId) ?? [];
    arr.push(t);
    groups.set(t.recurringId, arr);
  }

  const subs: Subscription[] = [];
  for (const [recurringId, items] of groups) {
    const sorted = items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    const latest = sorted[0];
    const monthly = Math.abs(latest.amount);
    const next = new Date(latest.date);
    next.setMonth(next.getMonth() + 1);
    subs.push({
      recurringId,
      name: latest.merchant,
      category: latest.category,
      monthlyCost: monthly,
      annualCost: monthly * 12,
      frequency: latest.frequency ?? 'monthly',
      lastCharge: latest.date,
      nextBilling: next.toISOString(),
      occurrences: items.length,
    });
  }
  return subs.sort((a, b) => b.monthlyCost - a.monthlyCost);
}

/** Just the subscription-category recurring services (Netflix, Spotify…). */
export function subscriptionServices(txs: Transaction[]): Subscription[] {
  return detectSubscriptions(txs).filter((s) => s.category === 'Subscriptions');
}

// ----------------------------- reports/insights ----------------------------

export interface Insight {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: 'positive' | 'negative' | 'neutral';
}

export function averageDailySpending(txs: Transaction[], ref = new Date()): number {
  // Average over the current month so far.
  const range = periodRange('month', ref);
  const slice = filterByRange(txs, range);
  const days = Math.max(1, ref.getDate());
  return totalExpenses(slice) / days;
}

export function uniqueMerchants(txs: Transaction[]): string[] {
  return [...new Set(txs.map((t) => t.merchant))].sort();
}

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

export interface TrendBucket {
  label: string;
  start: Date;
  end: Date;
}

/** The time buckets for a trend granularity over its trailing window. */
export function trendBuckets(granularity: Granularity, ref = new Date()): TrendBucket[] {
  if (granularity === 'daily') {
    return eachDayOfInterval({ start: subDays(ref, 13), end: ref }).map((b) => ({
      label: format(b, 'MMM d'),
      start: startOfDay(b),
      end: endOfDay(b),
    }));
  }
  if (granularity === 'weekly') {
    return eachWeekOfInterval({ start: subDays(ref, 7 * 9), end: ref }, { weekStartsOn: 1 }).map((b) => ({
      label: format(b, 'MMM d'),
      start: startOfWeek(b, { weekStartsOn: 1 }),
      end: endOfWeek(b, { weekStartsOn: 1 }),
    }));
  }
  return eachMonthOfInterval({ start: subMonths(ref, 11), end: ref }).map((b) => ({
    label: format(b, 'MMM'),
    start: startOfMonth(b),
    end: endOfMonth(b),
  }));
}

/** Spending/income trend bucketed by granularity over a trailing window. */
export function spendingTrend(
  txs: Transaction[],
  granularity: Granularity,
  ref = new Date()
): TrendPoint[] {
  return trendBuckets(granularity, ref).map((b) => {
    const slice = filterByRange(txs, { start: b.start, end: b.end });
    return { label: b.label, expenses: totalExpenses(slice), income: totalIncome(slice) };
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

// ---------------------- dashboard overview (server-safe) -------------------
//
// Aggregation split into two halves so the heavy work can run on the server
// while staying timezone-correct: the CLIENT computes the date windows (so
// "today"/"this week" match the user's timezone), then either side runs the
// pure `aggregateOverview` over those absolute windows. Identical inputs ->
// identical numbers, whether computed in the browser or on the server.

export interface RangeISO {
  start: string;
  end: string;
}

export interface OverviewRanges {
  periods: Record<Period, { cur: RangeISO; prev: RangeISO }>;
  trend: Record<Granularity, { label: string; start: string; end: string }[]>;
}

const PERIODS: Period[] = ['today', 'week', 'month', 'year'];
const GRANS: Granularity[] = ['daily', 'weekly', 'monthly'];

/** Build the absolute date windows the dashboard needs (run on the client). */
export function buildOverviewRanges(ref = new Date()): OverviewRanges {
  const iso = (r: DateRange): RangeISO => ({ start: r.start.toISOString(), end: r.end.toISOString() });
  const periods = {} as OverviewRanges['periods'];
  for (const p of PERIODS) periods[p] = { cur: iso(periodRange(p, ref)), prev: iso(previousRange(p, ref)) };
  const trend = {} as OverviewRanges['trend'];
  for (const g of GRANS) {
    trend[g] = trendBuckets(g, ref).map((b) => ({
      label: b.label,
      start: b.start.toISOString(),
      end: b.end.toISOString(),
    }));
  }
  return { periods, trend };
}

export interface PeriodData extends Summary {
  deltaIncome: number;
  deltaExpenses: number;
  deltaNet: number;
  byCategory: CategorySlice[];
}

export interface DashboardData {
  periods: Record<Period, PeriodData>;
  trend: Record<Granularity, TrendPoint[]>;
  recent: Transaction[];
}

function sliceAbs(txs: Transaction[], r: { start: string; end: string }): Transaction[] {
  const s = +new Date(r.start);
  const e = +new Date(r.end);
  return txs.filter((t) => {
    const d = +new Date(t.date);
    return d >= s && d <= e;
  });
}

/** Compute the full dashboard payload from transactions + precomputed windows. */
export function aggregateOverview(txs: Transaction[], ranges: OverviewRanges): DashboardData {
  const periods = {} as Record<Period, PeriodData>;
  for (const p of PERIODS) {
    const curTx = sliceAbs(txs, ranges.periods[p].cur);
    const cur = summarize(curTx);
    const prev = summarize(sliceAbs(txs, ranges.periods[p].prev));
    periods[p] = {
      ...cur,
      deltaIncome: pctChange(cur.income, prev.income),
      deltaExpenses: pctChange(cur.expenses, prev.expenses),
      deltaNet: pctChange(cur.net, prev.net),
      byCategory: spendingByCategory(curTx),
    };
  }
  const trend = {} as Record<Granularity, TrendPoint[]>;
  for (const g of GRANS) {
    trend[g] = ranges.trend[g].map((b) => {
      const slice = sliceAbs(txs, b);
      return { label: b.label, expenses: totalExpenses(slice), income: totalIncome(slice) };
    });
  }
  return { periods, trend, recent: recentTransactions(txs, 5) };
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

/** Build a Subscription summary from a group of same-merchant charges. */
function buildSubscription(recurringId: string, items: Transaction[], frequency: string): Subscription {
  const sorted = [...items].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const latest = sorted[0];
  const charge = Math.abs(latest.amount);

  // Normalize the charge to monthly/annual figures based on how often it repeats.
  const PER_YEAR: Record<string, number> = { weekly: 52, biweekly: 26, monthly: 12, quarterly: 4, yearly: 1 };
  const annualCost = charge * (PER_YEAR[frequency] ?? 12);
  const monthlyCost = annualCost / 12;

  // Project the next billing date one interval after the latest charge.
  const next = new Date(latest.date);
  if (frequency === 'weekly') next.setDate(next.getDate() + 7);
  else if (frequency === 'biweekly') next.setDate(next.getDate() + 14);
  else if (frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
  else if (frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);

  return {
    recurringId,
    name: latest.merchant,
    category: latest.category,
    monthlyCost,
    annualCost,
    frequency,
    lastCharge: latest.date,
    nextBilling: next.toISOString(),
    occurrences: items.length,
  };
}

// Recognizable subscription services. A charge from one of these is treated as
// recurring from the very first occurrence (no need to wait for 3 charges),
// since we know what it is. Tokens are matched against the space-stripped,
// normalized merchant name.
const KNOWN_RECURRING = [
  'netflix', 'spotify', 'hulu', 'disney', 'hbomax', 'youtubepremium', 'youtubetv',
  'primevideo', 'amazonprime', 'applemusic', 'appletv', 'icloud', 'adobe', 'chatgpt',
  'openai', 'dropbox', 'notion', 'patreon', 'nytimes', 'peacock', 'paramount',
  'audible', 'xboxgamepass', 'playstationplus', 'nintendoswitchonline', 'canva',
  'grammarly', 'linkedinpremium', 'githubcopilot', 'googleone', 'onedrive',
  'microsoft365', 'office365', 'uberone', 'doordashdashpass', 'instacart',
  'planetfitness', 'equinox', 'peloton', 'crunchyroll', 'twitch', 'expressvpn',
  'nordvpn', 'masterclass', 'duolingo', 'calm', 'headspace', 'medium',
  // gyms & fitness
  'lafitness', '24hourfitness', 'anytimefitness', 'goldsgym', 'orangetheory',
  'crunchfitness', 'ymca', 'classpass',
  // insurance (billed on a fixed schedule)
  'geico', 'progressive', 'statefarm', 'allstate', 'lemonade insurance', 'lemonadeins',
  // meal kits & boxes
  'hellofresh', 'blueapron', 'factor75', 'dollarshaveclub', 'barkbox', 'ipsy', 'fabfitfun',
  // more streaming/software
  'siriusxm', 'pandora', 'tidal', 'paramountplus', 'discoveryplus', 'espnplus',
  'substack', 'onlyfans', 'squarespace', 'wix', 'godaddy', '1password', 'lastpass',
];

function isKnownRecurring(normalizedKey: string): boolean {
  const k = normalizedKey.replace(/\s+/g, '');
  return KNOWN_RECURRING.some((t) => k.includes(t));
}

// Subscriptions are modest, steady amounts. This guards the "known brand from
// the first charge" path against one-off purchases that share a brand name —
// e.g. a $599 one-time software license, or two very different Apple charges
// (a movie rental vs. iCloud). Once 3+ regular charges exist, real cadence
// detection takes over and this is bypassed.
const KNOWN_SUB_MAX_CHARGE = 300; // a single charge above this is treated as a one-off

function looksLikeKnownSubscription(items: Transaction[]): boolean {
  if (items.length > 2) return false; // enough data existed but no cadence => not regular
  const amounts = items.map((t) => Math.abs(t.amount));
  const max = Math.max(...amounts);
  const min = Math.min(...amounts);
  if (max > KNOWN_SUB_MAX_CHARGE) return false;
  // With two charges, they should be about the same amount to look like a sub.
  if (items.length === 2 && (min <= 0 || max / min > 1.2)) return false;
  return true;
}

/** Normalize a merchant/description so the same payee groups together. */
function normalizeMerchant(m: string): string {
  return (m || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\b(com|inc|llc|co|ltd|pos|purchase|payment|recurring|autopay|bill|debit|ach)\b/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Categories where the bill arrives on a fixed schedule but the amount moves
// month to month (electricity in summer, water, a phone bill with overages).
// For these, regular SPACING is the real signal, so amounts may vary more.
const BILL_CATEGORIES = new Set(['Utilities', 'Housing', 'Healthcare', 'Subscriptions']);

/**
 * Infer a billing cadence from a payee's charges. Returns a frequency only when
 * the charges repeat at a regular interval — exact amounts for subscriptions,
 * looser amounts for bill-style categories (utilities etc.) — so true
 * subscriptions/bills are caught while ad-hoc spending (groceries, gas) isn't.
 */
function detectCadence(items: Transaction[]): string | null {
  if (items.length < 3) return null;

  // Amount consistency (coefficient of variation). Subscriptions are exact;
  // utility-style bills swing with usage, so they get a looser ceiling.
  const amounts = items.map((t) => Math.abs(t.amount));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  if (mean <= 0) return null;
  const variance = amounts.reduce((a, b) => a + (b - mean) ** 2, 0) / amounts.length;
  const cv = Math.sqrt(variance) / mean;
  const billLike = items.filter((t) => BILL_CATEGORIES.has(t.category)).length > items.length / 2;
  if (cv > (billLike ? 0.65 : 0.35)) return null;

  // Charge dates, collapsing near-duplicates (a split charge or a same-day
  // retry would otherwise inject ~0-day gaps and wreck the median).
  const dates = [...new Set(items.map((t) => +new Date(t.date)))].sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const g = (dates[i] - dates[i - 1]) / 86_400_000;
    if (g >= 2) gaps.push(g);
  }
  if (gaps.length < 2) return null;

  const med = median(gaps);
  // Most gaps should sit near the median (regular cadence, not random repeats).
  const tolerance = Math.max(4, med * 0.4);
  const regular = gaps.filter((g) => Math.abs(g - med) <= tolerance).length / gaps.length;
  if (regular < 0.6) return null;

  if (med >= 5 && med <= 10) return 'weekly';
  if (med >= 11 && med <= 18) return 'biweekly';
  if (med >= 24 && med <= 38) return 'monthly';
  if (med >= 80 && med <= 100) return 'quarterly';
  if (med >= 330 && med <= 400) return 'yearly';
  return null;
}

/**
 * Identify recurring subscription-style payments. Uses transactions explicitly
 * flagged recurring (manual entries, demo data) AND auto-detects recurring
 * payees from imported/bank data by spotting repeated, regularly-spaced charges.
 */
export function detectSubscriptions(txs: Transaction[]): Subscription[] {
  const subs: Subscription[] = [];

  // 1) Explicitly-flagged recurring expenses, grouped by recurringId.
  const flagged = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (t.type !== 'expense' || !t.isRecurring || !t.recurringId) continue;
    const arr = flagged.get(t.recurringId) ?? [];
    arr.push(t);
    flagged.set(t.recurringId, arr);
  }
  for (const [recurringId, items] of flagged) {
    subs.push(buildSubscription(recurringId, items, items[0].frequency ?? 'monthly'));
  }

  // 2) Auto-detect recurring payees among the remaining (unflagged) expenses.
  const byMerchant = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (t.type !== 'expense' || (t.isRecurring && t.recurringId)) continue;
    const key = normalizeMerchant(t.merchant);
    if (!key) continue;
    const arr = byMerchant.get(key) ?? [];
    arr.push(t);
    byMerchant.set(key, arr);
  }
  for (const [key, items] of byMerchant) {
    const cadence = detectCadence(items);
    if (cadence) {
      // A real repeating pattern (3+ regular charges) — high confidence.
      subs.push(buildSubscription(`auto_${key}`, items, cadence));
    } else if (isKnownRecurring(key) && looksLikeKnownSubscription(items)) {
      // Recognized brand with too little history yet to prove a pattern: treat
      // as a monthly subscription, but guard against one-time purchases from the
      // same brand (e.g. a pricey one-off, or inconsistent charges).
      subs.push(buildSubscription(`auto_${key}`, items, 'monthly'));
    }
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

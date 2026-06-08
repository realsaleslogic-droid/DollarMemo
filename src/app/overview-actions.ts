'use server';

import { createClient } from '@/lib/supabase/server';
import { rowToTransaction, type Row } from '@/lib/transactionRow';
import {
  aggregateOverview,
  spendingByCategory,
  subscriptionServices,
  detectSubscriptions,
  largestTransaction,
  type DashboardData,
  type OverviewRanges,
  type CategorySlice,
  type Subscription,
} from '@/lib/analytics';
import type { Transaction } from '@/lib/types';

const COLS =
  'id,date,merchant,category,amount,type,description,is_recurring,recurring_id,frequency';

/** Fetch the signed-in user's transactions (server-side), or null if no user. */
async function loadUserTransactions(): Promise<Transaction[] | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .select(COLS)
    .order('date', { ascending: false })
    .limit(50000);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(rowToTransaction);
}

/**
 * Server-side dashboard aggregation. The client passes the absolute date windows
 * (so timezones stay correct); we read the user's full history and return only
 * the compact, aggregated result. Returns null for signed-out/demo users.
 */
export async function getDashboardData(ranges: OverviewRanges): Promise<DashboardData | null> {
  const txs = await loadUserTransactions();
  if (!txs) return null;
  return aggregateOverview(txs, ranges);
}

export interface ReportsInsights {
  byCategory: CategorySlice[];
  subMonthly: number;
  subCount: number;
  largest: Transaction | null;
}

/** All-history report insights (category breakdown, subscriptions, largest). */
export async function getReportsInsights(): Promise<ReportsInsights | null> {
  const txs = await loadUserTransactions();
  if (!txs) return null;
  const services = subscriptionServices(txs);
  const subMonthly = services.reduce((s, x) => s + x.monthlyCost, 0);
  const subCount = (services.length ? services : detectSubscriptions(txs)).length;
  return { byCategory: spendingByCategory(txs), subMonthly, subCount, largest: largestTransaction(txs) };
}

/** All-history recurring/subscription detection. */
export async function getRecurringData(): Promise<Subscription[] | null> {
  const txs = await loadUserTransactions();
  if (!txs) return null;
  return detectSubscriptions(txs);
}

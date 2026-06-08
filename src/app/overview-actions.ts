'use server';

import { createClient } from '@/lib/supabase/server';
import { rowToTransaction, type Row } from '@/lib/transactionRow';
import { aggregateOverview, type DashboardData, type OverviewRanges } from '@/lib/analytics';

/**
 * Server-side dashboard aggregation. The client passes the absolute date windows
 * (so timezones stay correct); we read the user's transactions over their FULL
 * history and return only the compact, aggregated result — not thousands of rows.
 * Returns null for signed-out/demo users (the client computes locally then).
 */
export async function getDashboardData(ranges: OverviewRanges): Promise<DashboardData | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('transactions')
    .select('id,date,merchant,category,amount,type,description,is_recurring,recurring_id,frequency')
    .order('date', { ascending: false })
    .limit(50000);
  if (error) throw new Error(error.message);

  const txs = ((data ?? []) as Row[]).map(rowToTransaction);
  return aggregateOverview(txs, ranges);
}

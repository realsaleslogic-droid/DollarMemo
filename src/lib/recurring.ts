import type { Subscription } from './analytics';

/** The amount of a single charge (not the normalized monthly figure). */
export function perCharge(s: Subscription): number {
  if (s.frequency === 'weekly') return s.annualCost / 52;
  if (s.frequency === 'yearly') return s.annualCost;
  return s.monthlyCost;
}

function step(d: Date, freq: string, dir: 1 | -1): Date {
  const n = new Date(d);
  if (freq === 'weekly') n.setDate(n.getDate() + 7 * dir);
  else if (freq === 'yearly') n.setFullYear(n.getFullYear() + dir);
  else n.setMonth(n.getMonth() + dir);
  return n;
}

/** Every occurrence of a recurring charge that falls within [start, end]. */
export function occurrencesInRange(s: Subscription, start: Date, end: Date): Date[] {
  const out: Date[] = [];
  let cur = new Date(s.nextBilling);
  let guard = 0;
  while (cur > start && guard++ < 2000) cur = step(cur, s.frequency, -1);
  guard = 0;
  while (cur < start && guard++ < 2000) cur = step(cur, s.frequency, 1);
  guard = 0;
  while (cur <= end && guard++ < 2000) {
    out.push(new Date(cur));
    cur = step(cur, s.frequency, 1);
  }
  return out;
}

export interface UpcomingCharge {
  date: Date;
  sub: Subscription;
  amount: number;
}

/** The next `limit` charges across all recurring payments, soonest first. */
export function upcomingCharges(
  subs: Subscription[],
  from = new Date(),
  windowDays = 120,
  limit = 5
): UpcomingCharge[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + windowDays);

  const all: UpcomingCharge[] = [];
  for (const s of subs) {
    for (const date of occurrencesInRange(s, start, end)) {
      all.push({ date, sub: s, amount: perCharge(s) });
    }
  }
  all.sort((a, b) => +a.date - +b.date);
  return all.slice(0, limit);
}

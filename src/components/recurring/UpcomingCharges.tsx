'use client';

import { motion } from 'framer-motion';
import { format, differenceInCalendarDays } from 'date-fns';
import MerchantAvatar from '@/components/MerchantAvatar';
import { upcomingCharges } from '@/lib/recurring';
import { formatMoney } from '@/lib/format';
import type { Subscription } from '@/lib/analytics';

function whenLabel(date: Date): string {
  const days = differenceInCalendarDays(date, new Date());
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `in ${days} days`;
  return format(date, 'EEE, MMM d');
}

export default function UpcomingCharges({ subs }: { subs: Subscription[] }) {
  const upcoming = upcomingCharges(subs, new Date(), 120, 5);

  return (
    <div className="card p-5">
      <h3 className="font-bold">Next 5 charges</h3>
      <p className="mb-3 text-xs text-ink-soft">Your upcoming recurring payments</p>

      {upcoming.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">No upcoming charges detected.</p>
      ) : (
        <ul className="space-y-2.5">
          {upcoming.map((c, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <MerchantAvatar merchant={c.sub.name} category={c.sub.category} className="h-10 w-10 shrink-0" size={18} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.sub.name}</p>
                <p className="text-xs text-ink-soft">{whenLabel(c.date)}</p>
              </div>
              <p className="text-sm font-bold tabular-nums text-expense">-{formatMoney(c.amount)}</p>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

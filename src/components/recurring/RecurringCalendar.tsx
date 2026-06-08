'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import MerchantAvatar from '@/components/MerchantAvatar';
import { occurrencesInRange, perCharge } from '@/lib/recurring';
import { formatMoney } from '@/lib/format';
import type { Subscription } from '@/lib/analytics';
import { cn } from '@/lib/utils';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RecurringCalendar({ subs, className }: { subs: Subscription[]; className?: string }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const { days, byDay, leading } = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const byDay = new Map<number, Subscription[]>();
    for (const s of subs) {
      for (const d of occurrencesInRange(s, start, end)) {
        const k = d.getDate();
        const arr = byDay.get(k) ?? [];
        arr.push(s);
        byDay.set(k, arr);
      }
    }
    return { days: eachDayOfInterval({ start, end }), byDay, leading: getDay(start) };
  }, [subs, month]);

  return (
    <div className={cn('card p-5', className)}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Payment calendar</h3>
          <p className="text-xs text-ink-soft">{format(month, 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-2"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setMonth(startOfMonth(new Date()))}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-soft transition hover:bg-surface-2"
          >
            Today
          </button>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition hover:bg-surface-2"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-ink-soft">
        {DOW.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((d) => {
          const list = byDay.get(d.getDate()) ?? [];
          const has = list.length > 0;
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'group relative aspect-square rounded-xl border p-1 transition',
                has ? 'border-brand-400/40 bg-brand-500/5 hover:bg-brand-500/10' : 'border-line/50',
                isToday(d) && 'ring-2 ring-brand-400'
              )}
            >
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isToday(d) ? 'text-brand-600 dark:text-brand-300' : 'text-ink-soft'
                )}
              >
                {d.getDate()}
              </span>

              {has && (
                <div className="mt-0.5 flex flex-wrap gap-0.5">
                  {list.slice(0, 2).map((s, i) => (
                    <MerchantAvatar key={s.recurringId + i} merchant={s.name} category={s.category} className="h-5 w-5" size={11} />
                  ))}
                  {list.length > 2 && (
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-surface-2 text-[9px] font-bold text-ink-soft">
                      +{list.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Hover popover with the day's charges */}
              {has && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 hidden w-48 -translate-x-1/2 rounded-xl border border-line bg-surface p-2 text-left shadow-card-lg group-hover:block">
                  <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                    {format(d, 'MMM d')}
                  </p>
                  {list.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-1 py-0.5">
                      <MerchantAvatar merchant={s.name} category={s.category} className="h-5 w-5 shrink-0" size={11} />
                      <span className="flex-1 truncate text-xs font-medium">{s.name}</span>
                      <span className="text-xs font-semibold tabular-nums">{formatMoney(perCharge(s))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

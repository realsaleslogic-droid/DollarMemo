'use client';

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: 'brand' | 'income' | 'expense';
  delta?: number; // percent change vs previous period
  index?: number;
}

const ACCENTS = {
  brand: 'from-brand-500 to-brand-700',
  income: 'from-emerald-400 to-emerald-600',
  expense: 'from-[#f4715f] to-[#e0533f]',
};

export default function StatCard({ label, value, icon: Icon, accent = 'brand', delta }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="card relative overflow-hidden p-5 hover:shadow-card-lg">
      {/* Header: icon + label read as one unit; the metric below is the hero. */}
      <div className="flex items-center gap-2.5">
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br text-white shadow-glow', ACCENTS[accent])}>
          <Icon size={15} strokeWidth={2.4} />
        </span>
        <p className="truncate text-[13px] font-medium text-ink-soft">{label}</p>
      </div>

      <div className="mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <p className="text-[1.7rem] font-extrabold leading-none tracking-tight tabular-nums lg:text-[2rem]">
          {formatMoney(value)}
        </p>
        {delta !== undefined && (
          <span
            className={cn(
              'stat-pill',
              positive ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'
            )}
          >
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

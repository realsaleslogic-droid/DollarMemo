'use client';

import { motion } from 'framer-motion';
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

export default function StatCard({ label, value, icon: Icon, accent = 'brand', delta, index = 0 }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card relative overflow-hidden p-5"
    >
      <div className="flex items-start justify-between">
        <span className={cn('grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-glow', ACCENTS[accent])}>
          <Icon size={20} />
        </span>
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
      <p className="mt-4 text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">{formatMoney(value)}</p>
    </motion.div>
  );
}

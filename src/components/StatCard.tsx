'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import AnimatedMoney from './AnimatedMoney';
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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="card group relative overflow-hidden p-5 transition-shadow hover:shadow-card-lg"
    >
      {/* faint accent wash that lifts on hover */}
      <span
        className={cn(
          'pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25',
          ACCENTS[accent]
        )}
      />
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
      <AnimatedMoney
        value={value}
        className="mt-1 block text-2xl font-extrabold tracking-tight tabular-nums lg:text-3xl"
      />
    </motion.div>
  );
}

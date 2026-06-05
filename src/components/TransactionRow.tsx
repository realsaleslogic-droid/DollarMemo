'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import MerchantAvatar from './MerchantAvatar';
import type { Transaction } from '@/lib/types';
import { formatAbs, formatDateShort } from '@/lib/format';
import { categoryLabel } from '@/lib/categories';
import { cn } from '@/lib/utils';

export default function TransactionRow({
  tx,
  onEdit,
  onDelete,
  showActions = false,
}: {
  tx: Transaction;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}) {
  const isIncome = tx.type === 'income';

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 transition hover:bg-surface-2"
    >
      <MerchantAvatar merchant={tx.merchant} category={tx.category} className="h-11 w-11 shrink-0" size={20} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{tx.merchant}</p>
        <p className="truncate text-xs text-ink-soft">
          {categoryLabel(tx.category)} · {formatDateShort(tx.date)}
          {tx.isRecurring ? ' · recurring' : ''}
        </p>
      </div>

      <div className="text-right">
        <p className={cn('text-sm font-bold tabular-nums', isIncome ? 'text-income' : 'text-expense')}>
          {isIncome ? '+' : '-'}
          {formatAbs(tx.amount)}
        </p>
        {tx.description && <p className="max-w-[140px] truncate text-[11px] text-ink-soft">{tx.description}</p>}
      </div>

      {showActions && (
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit?.(tx)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-brand-600"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete?.(tx.id)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface hover:text-expense"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

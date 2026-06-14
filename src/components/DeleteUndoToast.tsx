'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, Undo2 } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';

/**
 * Bottom toast shown for a few seconds after deleting a transaction, with an
 * Undo. The actual deletion only commits when this window closes (see
 * useFinanceStore.removeTransaction), so a mis-tap is fully recoverable.
 */
export default function DeleteUndoToast() {
  const pending = useFinanceStore((s) => s.pendingDelete);
  const undo = useFinanceStore((s) => s.undoDelete);

  return (
    <AnimatePresence>
      {pending && (
        <motion.div
          key={pending.tx.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="fixed inset-x-0 bottom-24 z-[60] mx-auto flex w-fit max-w-[92vw] items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card-lg lg:bottom-6"
        >
          <Trash2 size={16} className="shrink-0 text-ink-soft" />
          <span className="truncate text-sm">
            Deleted <span className="font-semibold">{pending.tx.merchant}</span>
          </span>
          <button
            onClick={undo}
            className="ml-1 inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-500/20 dark:text-brand-300"
          >
            <Undo2 size={14} /> Undo
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

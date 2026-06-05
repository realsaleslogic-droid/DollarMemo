'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Delete, X, Loader2, Repeat } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { EXPENSE_CATEGORIES } from '@/lib/categories';
import type { Frequency } from '@/lib/types';
import { currencySymbol } from '@/lib/format';
import { cn } from '@/lib/utils';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function TransactionModal() {
  const { modalOpen, editing, closeModal } = useUIStore();
  const { addTransaction, editTransaction } = useFinanceStore();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('0');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [saving, setSaving] = useState(false);

  // Sync form when opening for add vs edit.
  useEffect(() => {
    if (!modalOpen) return;
    if (editing) {
      setType(editing.type);
      setAmount(String(Math.abs(editing.amount)));
      setMerchant(editing.merchant);
      setCategory(editing.category === 'Income' ? 'Food' : editing.category);
      setDate(editing.date.slice(0, 10));
      setDescription(editing.description ?? '');
      setIsRecurring(editing.isRecurring);
      setFrequency((editing.frequency as Frequency) || 'monthly');
    } else {
      setType('expense');
      setAmount('0');
      setMerchant('');
      setCategory('Food');
      setDate(new Date().toISOString().slice(0, 10));
      setDescription('');
      setIsRecurring(false);
      setFrequency('monthly');
    }
  }, [modalOpen, editing]);

  const numeric = useMemo(() => parseFloat(amount) || 0, [amount]);

  const press = (key: string) => {
    setAmount((prev) => {
      if (key === 'del') return prev.length <= 1 ? '0' : prev.slice(0, -1);
      if (key === '.') return prev.includes('.') ? prev : prev + '.';
      // limit to 2 decimals
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev;
      const next = prev === '0' ? key : prev + key;
      return next.slice(0, 12);
    });
  };

  const submit = async () => {
    if (numeric <= 0) return;
    setSaving(true);
    const input = {
      date: new Date(date).toISOString(),
      merchant: merchant.trim() || (type === 'income' ? 'Income' : 'Expense'),
      category: type === 'income' ? 'Income' : category,
      amount: numeric,
      type,
      description: description.trim() || null,
      isRecurring,
      frequency: isRecurring ? frequency : null,
    };
    try {
      if (editing) await editTransaction(editing.id, input);
      else await addTransaction(input);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-4xl bg-surface p-5 shadow-card-lg scroll-slim sm:max-w-md sm:rounded-4xl"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button onClick={closeModal} className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft hover:bg-surface-2">
                <X size={18} />
              </button>
            </div>

            {/* Type toggle */}
            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    'rounded-xl py-2 text-sm font-semibold capitalize transition',
                    type === t
                      ? t === 'income'
                        ? 'bg-income text-white shadow'
                        : 'bg-expense text-white shadow'
                      : 'text-ink-soft'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Amount display */}
            <div className="mb-4 rounded-3xl bg-brand-radial p-5 text-center text-white shadow-glow">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Amount</p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums">
                <span className="align-top text-2xl">{currencySymbol()}</span>
                {amount}
              </p>
            </div>

            {/* Fields */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Merchant / Source</label>
                <input
                  className="input"
                  placeholder={type === 'income' ? 'e.g. Payroll' : 'e.g. Starbucks'}
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>
              {type === 'expense' && (
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className={type === 'income' ? 'sm:col-span-2' : ''}>
                <label className="label">Date</label>
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Note (optional)</label>
                <input
                  className="input"
                  placeholder="Add a note"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Recurring */}
            <div className="mb-3 rounded-2xl border border-line bg-surface-2/60 p-3">
              <button
                type="button"
                role="switch"
                aria-checked={isRecurring}
                onClick={() => setIsRecurring((v) => !v)}
                className="flex w-full select-none items-center justify-between gap-3"
              >
                <span className="flex items-center gap-2.5 text-left">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600">
                    <Repeat size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">Recurring {type}</span>
                    <span className="block text-xs text-ink-soft">Repeats automatically over time</span>
                  </span>
                </span>
                <span
                  className={cn(
                    'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                    isRecurring ? 'bg-brand-500' : 'bg-line'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
                      isRecurring ? 'left-6' : 'left-1'
                    )}
                  />
                </span>
              </button>

              {isRecurring && (
                <div className="mt-3">
                  <p className="label">How often?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFrequency(f.id)}
                        className={cn(
                          'select-none rounded-xl py-2.5 text-sm font-semibold transition active:scale-[0.98]',
                          frequency === f.id
                            ? 'bg-brand-gradient text-white shadow-glow'
                            : 'bg-surface text-ink-soft hover:bg-surface-2'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Numeric keypad */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              {KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => press(k)}
                  className="flex h-12 items-center justify-center rounded-2xl bg-surface-2 text-lg font-bold text-ink transition hover:bg-brand-500/10 active:scale-95"
                >
                  {k === 'del' ? <Delete size={20} /> : k}
                </button>
              ))}
            </div>

            <button onClick={submit} disabled={saving || numeric <= 0} className="btn-primary w-full">
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {editing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

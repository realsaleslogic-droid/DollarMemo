'use client';

import { useMemo, useState } from 'react';
import { Search, Download, SlidersHorizontal, Inbox } from 'lucide-react';
import Topbar from '@/components/Topbar';
import TransactionRow from '@/components/TransactionRow';
import { ListSkeleton } from '@/components/Skeletons';
import { useReady } from '@/lib/useReady';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useUIStore } from '@/store/useUIStore';
import { CATEGORIES } from '@/lib/categories';
import { summarize } from '@/lib/analytics';
import { exportCSV } from '@/lib/export';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TransactionsPage() {
  const { transactions, ready } = useReady();
  const openEdit = useUIStore((s) => s.openEdit);
  const removeTransaction = useFinanceStore((s) => s.removeTransaction);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState<'all' | 'income' | 'expense'>('all');
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');

  const years = useMemo(
    () => [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))].sort((a, b) => b - a),
    [transactions]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions
      .filter((t) => {
        if (q && !t.merchant.toLowerCase().includes(q) && !(t.description ?? '').toLowerCase().includes(q)) return false;
        if (category !== 'all' && t.category !== category) return false;
        if (type !== 'all' && t.type !== type) return false;
        const d = new Date(t.date);
        if (month !== 'all' && d.getMonth() !== Number(month)) return false;
        if (year !== 'all' && d.getFullYear() !== Number(year)) return false;
        return true;
      })
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [transactions, search, category, type, month, year]);

  const sum = useMemo(() => summarize(filtered), [filtered]);

  // Group by day for a clean, statement-like list.
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const t of filtered) {
      const key = new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setType('all');
    setMonth('all');
    setYear('all');
  };

  return (
    <>
      <Topbar title="Transactions" subtitle="Search, filter & manage every transaction" />

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs font-medium text-ink-soft">Income</p>
          <p className="mt-1 text-xl font-extrabold text-income tabular-nums">{formatMoney(sum.income)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-ink-soft">Spending</p>
          <p className="mt-1 text-xl font-extrabold text-expense tabular-nums">{formatMoney(sum.expenses)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium text-ink-soft">Net</p>
          <p className={cn('mt-1 text-xl font-extrabold tabular-nums', sum.net >= 0 ? 'text-income' : 'text-expense')}>
            {formatMoney(sum.net)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 card p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              className="input pl-9"
              placeholder="Search merchant or note…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <select className="input" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="all">All types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select className="input" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="all">All months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={resetFilters} className="btn-ghost py-1.5 text-xs">
              <SlidersHorizontal size={14} /> Reset filters
            </button>
            <button onClick={() => exportCSV(filtered)} className="btn-soft py-1.5 text-xs">
              <Download size={14} /> Export CSV ({filtered.length})
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-4 card p-4">
        {!ready ? (
          <ListSkeleton rows={8} />
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-ink-soft">
            <Inbox size={32} />
            <p className="text-sm">No transactions match your filters.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(([day, items]) => (
              <div key={day}>
                <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">{day}</p>
                <div className="space-y-0.5">
                  {items.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} showActions onEdit={openEdit} onDelete={removeTransaction} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

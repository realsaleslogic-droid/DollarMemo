'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TrendPoint } from '@/lib/analytics';
import { formatCompact, formatMoney } from '@/lib/format';

export default function IncomeExpenseChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16b981" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#16b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4715f" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f4715f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgb(var(--line))" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--ink-soft))' }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => formatCompact(v)}
          tick={{ fontSize: 11, fill: 'rgb(var(--ink-soft))' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          formatter={(value: number, name) => [formatMoney(value), name === 'income' ? 'Income' : 'Expenses']}
          contentStyle={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 8px 24px -12px rgba(0,0,0,0.3)',
            background: 'rgb(var(--surface))',
            color: 'rgb(var(--ink))',
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: 'rgb(var(--ink-soft))', paddingTop: 8 }}
          formatter={(v) => (v === 'income' ? 'Income' : 'Expenses')}
        />
        <Area type="monotone" dataKey="income" stroke="#16b981" strokeWidth={2.5} fill="url(#incomeFill)" />
        <Area type="monotone" dataKey="expenses" stroke="#f4715f" strokeWidth={2.5} fill="url(#expenseFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

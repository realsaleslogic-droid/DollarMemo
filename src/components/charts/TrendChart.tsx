'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TrendPoint } from '@/lib/analytics';
import { formatCompact, formatMoney } from '@/lib/format';

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  const max = Math.max(...data.map((d) => d.expenses), 1);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 4, left: -16, bottom: 0 }} barCategoryGap="22%">
        <defs>
          <linearGradient id="barBrand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--brand-400))" />
            <stop offset="100%" stopColor="rgb(var(--brand-700))" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="rgb(var(--line))" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'rgb(var(--ink-soft))' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatCompact(v)}
          tick={{ fontSize: 11, fill: 'rgb(var(--ink-soft))' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          cursor={{ fill: 'rgb(var(--line))', opacity: 0.3 }}
          formatter={(value: number) => [formatMoney(value), 'Spent']}
          contentStyle={{
            borderRadius: 12,
            border: 'none',
            boxShadow: '0 8px 24px -12px rgba(0,0,0,0.3)',
            background: 'rgb(var(--surface))',
            color: 'rgb(var(--ink))',
          }}
        />
        <Bar dataKey="expenses" radius={[8, 8, 4, 4]} maxBarSize={42}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.expenses >= max * 0.999 ? 'rgb(var(--brand-700))' : 'url(#barBrand)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

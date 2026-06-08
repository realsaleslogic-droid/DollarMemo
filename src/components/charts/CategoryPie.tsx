'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySlice } from '@/lib/analytics';
import { formatMoney } from '@/lib/format';

export default function CategoryPie({ data }: { data: CategorySlice[] }) {
  if (!data.length) {
    return <div className="grid h-[260px] place-items-center text-sm text-ink-soft">No spending in this period</div>;
  }

  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="label"
            innerRadius={72}
            outerRadius={108}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.category} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name) => [formatMoney(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 8px 24px -12px rgba(0,0,0,0.3)',
              background: 'rgb(var(--surface))',
              color: 'rgb(var(--ink))',
            }}
            itemStyle={{ color: 'rgb(var(--ink))' }}
            labelStyle={{ color: 'rgb(var(--ink))' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center total */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium text-ink-soft">Total Spent</span>
        <span className="text-2xl font-extrabold">{formatMoney(total)}</span>
      </div>
    </div>
  );
}

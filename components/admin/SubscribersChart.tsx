'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import type { MonthlyPoint } from '@/lib/admin/dashboard';

// Subscribers-per-month bar chart. recharts' ResponsiveContainer measures width
// after mount, which mismatches SSR. The mounted-guard keeps the server output
// and the FIRST client render identical (same-height placeholder), then swaps in
// the chart post-mount — zero hydration mismatch (the global #418 lesson).

const HEIGHT = 280;

export default function SubscribersChart({ data }: { data: MonthlyPoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ height: HEIGHT }} aria-hidden />;
  }

  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="rgba(92,58,32,0.12)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#5D4E3A', fontSize: 12, fontFamily: 'var(--font-lora)' }}
          axisLine={{ stroke: 'rgba(92,58,32,0.25)' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: '#5D4E3A', fontSize: 12, fontFamily: 'var(--font-lora)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(184,115,51,0.08)' }}
          contentStyle={{
            backgroundColor: '#F5EBD8',
            border: '1px solid rgba(92,58,32,0.25)',
            borderRadius: 6,
            fontFamily: 'var(--font-lora)',
            fontSize: 13,
            color: '#2A2218',
          }}
          labelStyle={{ color: '#5C3A20', fontWeight: 700 }}
          formatter={(value: number) => [`${value}`, 'Abonați']}
        />
        <Bar dataKey="count" fill="#8B5E3C" radius={[4, 4, 0, 0]} maxBarSize={56} />
      </BarChart>
    </ResponsiveContainer>
  );
}

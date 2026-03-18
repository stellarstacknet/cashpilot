import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySnapshot } from '@/types';

interface TrendChartProps {
  snapshots: MonthlySnapshot[];
}

export function TrendChart({ snapshots }: TrendChartProps) {
  const data = snapshots.map((s) => ({
    name: `${s.year}.${String(s.month).padStart(2, '0')}`,
    income: s.totalIncome,
    bills: s.totalBills,
    savings: s.totalSavings,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" fontSize={11} tick={{ fill: '#9ca3af' }} />
        <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
        <Tooltip
          formatter={(value) => `${Number(value).toLocaleString()}원`}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="income" name="수입" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        <Bar dataKey="bills" name="청구액" fill="#F43F5E" radius={[6, 6, 0, 0]} />
        <Line
          type="monotone"
          dataKey="savings"
          name="저축"
          stroke="#10B981"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

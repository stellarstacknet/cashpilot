import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlySnapshot } from '@/types';
import { useCardStore } from '@/stores/useCardStore';

interface CardBreakdownProps {
  snapshots: MonthlySnapshot[];
}

export function CardBreakdown({ snapshots }: CardBreakdownProps) {
  const cards = useCardStore((s) => s.cards);

  if (cards.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        등록된 카드가 없습니다.
      </div>
    );
  }

  const data = snapshots.map((s) => {
    const entry: Record<string, string | number> = {
      name: `${s.year}.${String(s.month).padStart(2, '0')}`,
    };
    for (const card of cards) {
      const bill = s.bills.find((b) => b.cardId === card.id);
      entry[card.name] = bill?.amount || 0;
    }
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" fontSize={11} tick={{ fill: '#9ca3af' }} />
        <YAxis fontSize={11} tick={{ fill: '#9ca3af' }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
        <Tooltip
          formatter={(value) => `${Number(value).toLocaleString()}원`}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
        />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        {cards.map((card) => (
          <Line
            key={card.id}
            type="monotone"
            dataKey={card.name}
            stroke={card.color}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, stroke: '#fff', fill: card.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { MonthlySnapshot } from '@/types';
import { useCardStore } from '@/stores/useCardStore';
import { formatWon, formatYearMonth } from '@/utils/formatter';

interface MonthlyDetailProps {
  snapshots: MonthlySnapshot[];
}

export function MonthlyDetail({ snapshots }: MonthlyDetailProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cards = useCardStore((s) => s.cards);

  return (
    <div className="space-y-2">
      {[...snapshots].reverse().map((snapshot) => (
        <div key={snapshot.id} className="rounded-xl border bg-white overflow-hidden">
          <button
            className="flex w-full items-center justify-between p-3.5 text-sm hover:bg-muted/30 transition-colors"
            onClick={() =>
              setExpandedId(expandedId === snapshot.id ? null : snapshot.id)
            }
          >
            <div className="flex items-center gap-2">
              {expandedId === snapshot.id ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-semibold">
                {formatYearMonth(snapshot.year, snapshot.month)}
              </span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-blue-600 font-medium">수입 {formatWon(snapshot.totalIncome)}</span>
              <span className="text-rose-600 font-medium">지출 {formatWon(snapshot.totalBills)}</span>
            </div>
          </button>

          {expandedId === snapshot.id && (
            <div className="border-t px-4 pb-3.5 pt-2.5 space-y-1.5 bg-muted/20">
              {snapshot.bills.map((bill) => {
                const card = cards.find((c) => c.id === bill.cardId);
                return (
                  <div key={bill.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {card && (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: card.color }}
                        />
                      )}
                      <span>{card?.name || '알 수 없는 카드'}</span>
                    </div>
                    <span className="font-mono text-sm">{formatWon(bill.amount)}</span>
                  </div>
                );
              })}
              <div className="mt-2 border-t pt-2 flex justify-between text-sm font-semibold">
                <span>저축</span>
                <span className="text-emerald-600">{formatWon(snapshot.totalSavings)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

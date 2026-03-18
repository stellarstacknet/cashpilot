import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { BillInputCard } from './BillInputCard';
import { formatWon } from '@/utils/formatter';

interface BillInputListProps {
  year: number;
  month: number;
}

export function BillInputList({ year, month }: BillInputListProps) {
  const cards = useCardStore((s) => s.cards).filter((c) => c.isActive);
  const { setBill, getBillForCard } = useBillStore();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const monthBills = cards.map((card) => ({
    card,
    bill: getBillForCard(card.id, year, month),
    previousBill: getBillForCard(card.id, prevYear, prevMonth),
  }));

  const totalBills = monthBills.reduce((sum, { bill }) => sum + (bill?.amount || 0), 0);
  const allEntered = cards.length > 0 && monthBills.every(({ bill }) => bill && bill.amount > 0);

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        등록된 카드가 없습니다. 설정에서 카드를 먼저 추가해 주세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {monthBills.map(({ card, bill, previousBill }) => (
        <BillInputCard
          key={card.id}
          card={card}
          bill={bill}
          previousBill={previousBill}
          onAmountChange={(cardId, amount) => setBill(cardId, year, month, amount)}
        />
      ))}

      <div className="rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">총 청구액</span>
          <span className="font-mono text-lg font-bold">{formatWon(totalBills)}</span>
        </div>
        {allEntered && (
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">모든 청구서 입력 완료</p>
        )}
      </div>
    </div>
  );
}

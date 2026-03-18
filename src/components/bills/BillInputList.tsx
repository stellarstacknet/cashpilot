import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { BillInputCard } from './BillInputCard';
import { formatWon } from '@/utils/formatter';
import { CheckCircle2, Receipt } from 'lucide-react';

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
  const enteredCount = monthBills.filter(({ bill }) => bill && bill.amount > 0).length;
  const allEntered = cards.length > 0 && enteredCount === cards.length;

  // 카드가 없는 경우 안내 메시지와 CTA 표시
  if (cards.length === 0) {
    return (
      <div className="card-elevated py-16 text-center">
        <div className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Receipt className="h-7 w-7 text-primary" />
        </div>
        <h3 className="font-display text-base font-semibold">카드를 먼저 등록해주세요</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          자산 탭에서 카드를 추가하면<br />청구서를 입력할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {monthBills.map(({ card, bill, previousBill }) => (
        <BillInputCard
          key={card.id}
          card={card}
          bill={bill}
          previousBill={previousBill}
          onAmountChange={(cardId, amount) => setBill(cardId, year, month, amount)}
        />
      ))}

      <div className="hero-gradient rounded-2xl p-4 text-white dark:text-black">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-white/60 dark:text-black/50">총 청구액</p>
            <p className="font-display text-xl font-bold tabular-nums tracking-tight mt-0.5">
              {formatWon(totalBills)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/60 dark:text-black/50">{enteredCount}/{cards.length} 입력</p>
            {allEntered && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-white/70 dark:text-black/60">
                <CheckCircle2 className="h-3.5 w-3.5" />
                완료
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

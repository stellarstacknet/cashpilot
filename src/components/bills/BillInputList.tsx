import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { BillInputCard } from './BillInputCard';
import { formatWon } from '@/utils/formatter';
import { getBankLogo, BANK_COLORS } from '@/utils/constants';
import { CheckCircle2, Receipt } from 'lucide-react';

interface BillInputListProps {
  year: number;
  month: number;
}

export function BillInputList({ year, month }: BillInputListProps) {
  const cards = useCardStore((s) => s.cards).filter((c) => c.isActive);
  const { setBill, getBillForCard } = useBillStore();
  const expenses = useFixedExpenseStore((s) => s.expenses);
  const accounts = useAccountStore((s) => s.accounts);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const monthBills = cards.map((card) => ({
    card,
    bill: getBillForCard(card.id, year, month),
    previousBill: getBillForCard(card.id, prevYear, prevMonth),
  }));

  const accountFixed = expenses
    .filter((e) => e.payMethod === 'account' && e.accountId)
    .sort((a, b) => a.payDay - b.payDay || a.sortOrder - b.sortOrder);

  const cardBillsTotal = monthBills.reduce((sum, { bill }) => sum + (bill?.amount || 0), 0);
  const fixedTotal = accountFixed.reduce((sum, e) => sum + e.amount, 0);
  const totalBills = cardBillsTotal + fixedTotal;
  const enteredCount = monthBills.filter(({ bill }) => bill && bill.amount > 0).length;
  const allEntered = cards.length > 0 && enteredCount === cards.length;

  // 카드가 없는 경우 안내 메시지와 CTA 표시
  if (cards.length === 0) {
    return (
      <div className="card-elevated py-16 text-center">
        <div className="empty-state-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground">
          <Receipt className="h-7 w-7 text-background" />
        </div>
        <h3 className="font-display text-base font-bold">카드를 먼저 추가하세요</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          자산 탭에서 카드를 추가하면<br />청구서를 입력할 수 있어요.
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

      {accountFixed.length > 0 && (
        <div className="pt-2">
          <p className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground/60">
            고정비 · 계좌이체
          </p>
          <div className="space-y-2">
            {accountFixed.map((e) => {
              const acc = accounts.find((a) => a.id === e.accountId);
              const bankLogo = acc ? getBankLogo(acc.bank) : null;
              const bankColor = acc ? BANK_COLORS[acc.bank] || '#6b7280' : '#6b7280';
              return (
                <div key={e.id} className="card-elevated flex items-center gap-3.5 p-4">
                  {bankLogo ? (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                      <img src={bankLogo} alt={acc?.bank} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white text-[11px] font-extrabold"
                      style={{ backgroundColor: bankColor }}
                    >
                      {acc?.bank.slice(0, 2) || '—'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="block truncate text-[15px] font-extrabold">{e.name}</span>
                    <span className="text-[12px] text-muted-foreground">
                      {acc ? `${acc.bank}` : ''} · {e.payDay}일 이체
                    </span>
                  </div>
                  <span className="font-display text-base font-extrabold tabular-nums">
                    {formatWon(e.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card-elevated rounded-xl p-4 text-white">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-white/60">총 청구액</p>
            <p className="font-display text-xl font-extrabold tabular-nums tracking-tight mt-0.5 text-white">
              {formatWon(totalBills)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-white/60">{enteredCount}/{cards.length} 입력</p>
            {allEntered && (
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-white/70">
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

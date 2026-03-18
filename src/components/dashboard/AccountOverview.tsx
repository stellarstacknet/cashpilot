// 계좌별 현황 컴포넌트
// 각 계좌의 현재 잔액, 연결 카드 청구액, 결제 후 잔액 표시
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { formatWon } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface AccountOverviewProps {
  year: number;
  month: number;
}

export function AccountOverview({ year, month }: AccountOverviewProps) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);

  const accountData = useMemo(() => {
    const monthBills = bills.filter((b) => b.year === year && b.month === month);
    const activeCards = cards.filter((c) => c.isActive);

    return accounts.map((account) => {
      const linkedCards = activeCards.filter((c) => c.linkedAccountId === account.id);
      const billTotal = linkedCards.reduce((sum, card) => {
        const bill = monthBills.find((b) => b.cardId === card.id);
        return sum + (bill?.amount || 0);
      }, 0);
      const afterPayment = account.balance - billTotal;

      return { account, linkedCards, billTotal, afterPayment, monthBills };
    });
  }, [accounts, cards, bills, year, month]);

  if (accounts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {accountData.map(({ account, linkedCards, billTotal, afterPayment, monthBills }) => (
        <div key={account.id} className="glass-elevated rounded-2xl p-4 press-scale">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 font-display text-xs font-bold text-primary">
                {account.bank.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold">{account.name}</p>
                <p className="text-[11px] text-muted-foreground">{account.bank}</p>
              </div>
            </div>
            <p className="font-display text-base font-bold tabular-nums tracking-tight">
              {formatWon(account.balance)}
            </p>
          </div>

          {billTotal > 0 && (
            <div className="mt-3.5 space-y-2 border-t border-border/40 pt-3.5">
              {linkedCards.map((card) => {
                const bill = monthBills.find((b) => b.cardId === card.id);
                if (!bill || bill.amount === 0) return null;
                return (
                  <div key={card.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: card.color }} />
                      <span className="text-muted-foreground">{card.name}</span>
                    </div>
                    <span className="amount-negative tabular-nums font-medium">
                      -{formatWon(bill.amount)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t border-dashed border-border/30 pt-2.5">
                <span className="text-[11px] text-muted-foreground">결제 후</span>
                <span className={cn(
                  'font-display text-sm font-bold tabular-nums',
                  afterPayment >= 0 ? 'amount-positive' : 'amount-negative',
                )}>
                  {formatWon(afterPayment)}
                </span>
              </div>
            </div>
          )}

          {billTotal === 0 && linkedCards.length === 0 && (
            <p className="mt-2.5 text-[11px] text-muted-foreground">연결된 카드 없음</p>
          )}
        </div>
      ))}
    </div>
  );
}

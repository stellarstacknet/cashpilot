// 계좌별 현황 컴포넌트
// 은행 글자 배지 + 잔액 + 결제 내역 리스트
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { formatWon } from '@/utils/formatter';

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
    <div className="space-y-3">
      {accountData.map(({ account, linkedCards, billTotal, afterPayment, monthBills }) => {
        const usageRatio = account.balance > 0
          ? Math.min((billTotal / account.balance) * 100, 100)
          : 0;

        return (
          <div key={account.id} className="card-elevated p-5 press-scale">
            {/* 계좌 헤더 */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-background text-[11px] font-bold">
                {account.bank.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold truncate">{account.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{account.bank}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[20px] font-extrabold tabular-nums tracking-tight">
                  {formatWon(account.balance)}
                </p>
              </div>
            </div>

            {/* 결제 내역 */}
            {billTotal > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                {/* 사용률 바 */}
                <div className="mb-3">
                  <div className="h-[5px] rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-foreground/30 transition-all duration-700 ease-out"
                      style={{ width: `${usageRatio}%` }}
                    />
                  </div>
                </div>

                {/* 카드별 청구 */}
                <div className="space-y-2">
                  {linkedCards.map((card) => {
                    const bill = monthBills.find((b) => b.cardId === card.id);
                    if (!bill || bill.amount === 0) return null;
                    return (
                      <div key={card.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: card.color }}
                          />
                          <span className="text-[13px] text-muted-foreground">{card.name}</span>
                        </div>
                        <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
                          -{formatWon(bill.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 결제 후 잔액 */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-border/40">
                  <span className="text-[13px] text-muted-foreground font-medium">결제 후 잔액</span>
                  <span className="font-display text-[16px] font-extrabold tabular-nums text-foreground">
                    {formatWon(afterPayment)}
                  </span>
                </div>
              </div>
            )}

            {billTotal === 0 && linkedCards.length === 0 && (
              <p className="mt-3 text-[12px] text-muted-foreground">연결된 카드 없음</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

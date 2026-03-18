// 계좌별 현황 컴포넌트
// 잔여액 메인 + 카드별 청구 내역
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { formatWon } from '@/utils/formatter';
import { BANK_COLORS } from '@/utils/constants';
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
    <div className="space-y-3">
      {accountData.map(({ account, linkedCards, billTotal, afterPayment, monthBills }) => {
        const remainingRatio = account.balance > 0
          ? Math.max(0, Math.min((afterPayment / account.balance) * 100, 100))
          : 0;

        return (
          <div key={account.id} className="card-elevated p-5 press-scale">
            {/* 계좌 헤더: 은행 뱃지 + 잔여액 메인 */}
            <div className="flex items-center gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-[11px] font-bold shadow-lg"
                style={{
                  backgroundColor: BANK_COLORS[account.bank] || '#6B7280',
                  boxShadow: `0 4px 12px ${BANK_COLORS[account.bank] || '#6B7280'}40`,
                }}
              >
                {account.bank.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold truncate">{account.name}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{account.bank}</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-display text-[20px] font-extrabold tabular-nums tracking-tight',
                  afterPayment >= 0 ? 'text-blue-500' : 'text-red-500',
                )}>
                  {formatWon(afterPayment)}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">결제 후</p>
              </div>
            </div>

            {/* 결제 내역 */}
            {billTotal > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                {/* 잔여 비율 바 */}
                <div className="mb-3">
                  <div className="h-[6px] rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${remainingRatio}%`,
                        background: remainingRatio > 50
                          ? 'linear-gradient(90deg, #818cf8, #6366f1)'
                          : remainingRatio > 20
                            ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                            : 'linear-gradient(90deg, #f87171, #ef4444)',
                      }}
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
                        <span className="text-[13px] font-semibold text-red-500 tabular-nums">
                          -{formatWon(bill.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 잔액 (보조 정보) */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-border/40">
                  <span className="text-[13px] text-muted-foreground font-medium">잔액</span>
                  <span className="text-[13px] font-semibold tabular-nums text-muted-foreground">
                    {formatWon(account.balance)}
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

// 계좌별 현황 컴포넌트
// 잔여액 메인 + 카드별 청구 내역 (접기/펼치기)
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import { formatWon } from '@/utils/formatter';
import { BANK_COLORS, getBankLogo, getCardLogo } from '@/utils/constants';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountOverviewProps {
  year: number;
  month: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function AccountOverview({ year, month, expandedIds, onToggle }: AccountOverviewProps) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);
  const fixedExpenses = useFixedExpenseStore((s) => s.expenses);

  const accountData = useMemo(() => {
    const monthBills = bills.filter((b) => b.year === year && b.month === month);
    const activeCards = cards.filter((c) => c.isActive);

    // 아직 빠지지 않은 계좌이체 고정비
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const today = now.getDate();

    let pendingFixed: typeof fixedExpenses = [];
    if (year === currentYear && month === currentMonth) {
      pendingFixed = fixedExpenses.filter((e) => e.payMethod === 'account' && e.accountId && e.payDay > today);
    } else if (year > currentYear || (year === currentYear && month > currentMonth)) {
      pendingFixed = fixedExpenses.filter((e) => e.payMethod === 'account' && e.accountId);
    }

    return accounts.map((account) => {
      const linkedCards = activeCards.filter((c) => c.linkedAccountId === account.id);
      const billTotal = linkedCards.reduce((sum, card) => {
        const bill = monthBills.find((b) => b.cardId === card.id);
        return sum + (bill?.amount || 0);
      }, 0);
      const fixedTotal = pendingFixed
        .filter((e) => e.accountId === account.id)
        .reduce((sum, e) => sum + e.amount, 0);
      const totalDeductions = billTotal + fixedTotal;
      const afterPayment = account.balance - totalDeductions;
      const accountFixedExpenses = pendingFixed.filter((e) => e.accountId === account.id);

      return { account, linkedCards, billTotal, fixedTotal, totalDeductions, afterPayment, monthBills, accountFixedExpenses };
    });
  }, [accounts, cards, bills, fixedExpenses, year, month]);

  if (accounts.length === 0) return null;

  return (
    <div className="space-y-3">
      {accountData.map(({ account, linkedCards, totalDeductions, afterPayment, monthBills, accountFixedExpenses }) => {
        const remainingRatio = account.balance > 0
          ? Math.max(0, Math.min((afterPayment / account.balance) * 100, 100))
          : 0;
        const isExpanded = expandedIds.has(account.id);
        const hasDeductions = totalDeductions > 0;

        return (
          <div key={account.id} className="card-elevated overflow-hidden">
            {/* 계좌 헤더 */}
            <div
              className={cn(
                'flex items-center gap-3.5 p-5 press-scale',
                hasDeductions && 'cursor-pointer',
              )}
              onClick={() => hasDeductions && onToggle(account.id)}
            >
              {getBankLogo(account.bank) ? (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={getBankLogo(account.bank)!}
                    alt={account.bank}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-extrabold"
                  style={{
                    backgroundColor: BANK_COLORS[account.bank] || '#6B7280',
                    boxShadow: `0 4px 12px ${BANK_COLORS[account.bank] || '#6B7280'}40`,
                  }}
                >
                  {account.bank.slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-extrabold truncate">{account.bank}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className={cn(
                    'font-display text-[20px] font-black tabular-nums tracking-tight',
                    afterPayment >= 0 ? 'text-[#3a9bd5]' : 'text-[#e53535]',
                  )}>
                    {formatWon(afterPayment)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">결제 후</p>
                </div>
                {hasDeductions && (
                  <ChevronRight className={cn(
                    'h-4 w-4 text-muted-foreground/50 transition-transform duration-200',
                    isExpanded && 'rotate-90',
                  )} />
                )}
              </div>
            </div>

            {/* 접히는 결제 내역 */}
            <div
              className={cn(
                'grid transition-all duration-300 ease-out',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                {hasDeductions && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/50">
                    <div className="my-4">
                      <div className="h-[6px] bg-muted/60 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${remainingRatio}%`,
                            background: remainingRatio > 50
                              ? '#3a9bd5'
                              : remainingRatio > 20
                                ? '#e5a000'
                                : '#e53535',
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {linkedCards.map((card) => {
                        const bill = monthBills.find((b) => b.cardId === card.id);
                        if (!bill || bill.amount === 0) return null;
                        return (
                          <div key={card.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              {getCardLogo(card.issuer) ? (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md">
                                  <img src={getCardLogo(card.issuer)!} alt="" className="h-full w-full object-contain" />
                                </div>
                              ) : (
                                <div
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white text-[8px] font-extrabold"
                                  style={{ backgroundColor: card.color }}
                                >
                                  {card.issuer.slice(0, 2)}
                                </div>
                              )}
                              <span className="text-[13px] text-muted-foreground">{card.name}</span>
                            </div>
                            <span className="text-[13px] font-bold text-[#e53535] tabular-nums">
                              -{formatWon(bill.amount)}
                            </span>
                          </div>
                        );
                      })}
                      {accountFixedExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[8px] font-extrabold text-muted-foreground">
                              {expense.payDay}
                            </div>
                            <span className="text-[13px] text-muted-foreground">{expense.name}</span>
                          </div>
                          <span className="text-[13px] font-bold text-[#e53535] tabular-nums">
                            -{formatWon(expense.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-border/40">
                      <span className="text-[13px] text-muted-foreground font-semibold">잔액</span>
                      <span className="text-[13px] font-bold tabular-nums text-muted-foreground">
                        {formatWon(account.balance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {totalDeductions === 0 && linkedCards.length === 0 && (
              <p className="px-5 pb-5 text-[12px] text-muted-foreground">연결된 카드 없음</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

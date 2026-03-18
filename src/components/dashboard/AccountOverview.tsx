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

  if (accounts.length === 0) return null;

  const monthBills = bills.filter((b) => b.year === year && b.month === month);
  const activeCards = cards.filter((c) => c.isActive);

  const accountData = accounts.map((account) => {
    const linkedCards = activeCards.filter((c) => c.linkedAccountId === account.id);
    const billTotal = linkedCards.reduce((sum, card) => {
      const bill = monthBills.find((b) => b.cardId === card.id);
      return sum + (bill?.amount || 0);
    }, 0);
    const afterPayment = account.balance - billTotal;

    return { account, linkedCards, billTotal, afterPayment };
  });

  return (
    <div className="space-y-3">
      {accountData.map(({ account, linkedCards, billTotal, afterPayment }) => (
        <div key={account.id} className="rounded-2xl bg-card border border-border/40 p-5 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-semibold">{account.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{account.bank}</p>
            </div>
            <p className="font-display text-lg font-bold tabular-nums tracking-tight">{formatWon(account.balance)}</p>
          </div>

          {billTotal > 0 && (
            <div className="mt-4 border-t border-border/30 pt-4 space-y-2.5">
              {linkedCards.map((card) => {
                const bill = monthBills.find((b) => b.cardId === card.id);
                if (!bill || bill.amount === 0) return null;
                return (
                  <div key={card.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: card.color }} />
                      <span className="text-muted-foreground">{card.name} ({card.paymentDay}일)</span>
                    </div>
                    <span className="text-red-500 dark:text-red-400 tabular-nums font-semibold">-{formatWon(bill.amount)}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2.5 border-t border-dashed border-border/30">
                <span className="text-xs font-medium text-muted-foreground">결제 후 잔액</span>
                <span className={cn(
                  'font-display text-base font-bold tabular-nums tracking-tight',
                  afterPayment >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
                )}>
                  {formatWon(afterPayment)}
                </span>
              </div>
            </div>
          )}

          {billTotal === 0 && linkedCards.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">연결된 카드 없음</p>
          )}
        </div>
      ))}
    </div>
  );
}

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

    return {
      account,
      linkedCards,
      billTotal,
      afterPayment,
    };
  });

  return (
    <div className="space-y-2">
      {accountData.map(({ account, linkedCards, billTotal, afterPayment }) => (
        <div key={account.id} className="rounded-xl border bg-white p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{account.name}</p>
              <p className="text-xs text-muted-foreground">{account.bank}</p>
            </div>
            <p className="text-sm font-bold font-mono">{formatWon(account.balance)}</p>
          </div>

          {billTotal > 0 && (
            <div className="mt-2.5 border-t pt-2.5 space-y-1">
              {linkedCards.map((card) => {
                const bill = monthBills.find((b) => b.cardId === card.id);
                if (!bill || bill.amount === 0) return null;
                return (
                  <div key={card.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: card.color }} />
                      <span className="text-muted-foreground">{card.name} ({card.paymentDay}일)</span>
                    </div>
                    <span className="text-rose-600 font-mono">-{formatWon(bill.amount)}</span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-1 border-t border-dashed">
                <span className="text-xs font-medium">결제 후 잔액</span>
                <span className={cn(
                  'text-sm font-bold font-mono',
                  afterPayment >= 0 ? 'text-emerald-600' : 'text-red-600',
                )}>
                  {formatWon(afterPayment)}
                </span>
              </div>
            </div>
          )}

          {billTotal === 0 && linkedCards.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">연결된 카드 없음</p>
          )}
        </div>
      ))}
    </div>
  );
}

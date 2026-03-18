import { useState, useEffect } from 'react';
import type { Card as CardType, MonthlyBill } from '@/types';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseAmountInput } from '@/utils/formatter';
import { useAccountStore } from '@/stores/useAccountStore';

interface BillInputCardProps {
  card: CardType;
  bill?: MonthlyBill;
  previousBill?: MonthlyBill;
  onAmountChange: (cardId: string, amount: number) => void;
}

export function BillInputCard({
  card,
  bill,
  previousBill,
  onAmountChange,
}: BillInputCardProps) {
  const [inputValue, setInputValue] = useState(bill?.amount ? formatCurrency(bill.amount) : '');
  const accounts = useAccountStore((s) => s.accounts);
  const linkedAccount = accounts.find((a) => a.id === card.linkedAccountId);

  useEffect(() => {
    if (bill?.amount) {
      setInputValue(formatCurrency(bill.amount));
    }
  }, [bill?.amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const amount = parseAmountInput(raw);
    setInputValue(amount > 0 ? formatCurrency(amount) : '');
    onAmountChange(card.id, amount);
  };

  return (
    <div className="glass-elevated rounded-2xl p-4 press-scale">
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-bold"
          style={{ backgroundColor: card.color }}
        >
          {card.name.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold truncate block">{card.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {linkedAccount ? `${linkedAccount.bank}` : ''} · {card.paymentDay}일 결제
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          type="text"
          inputMode="numeric"
          placeholder={
            previousBill
              ? `지난달: ${formatCurrency(previousBill.amount)}`
              : '금액 입력'
          }
          value={inputValue}
          onChange={handleChange}
          className="font-display tabular-nums rounded-xl border-border/40 bg-muted/30 text-base font-semibold"
        />
        <span className="text-xs font-medium text-muted-foreground shrink-0">원</span>
      </div>
    </div>
  );
}

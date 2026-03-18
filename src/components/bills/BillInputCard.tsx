import { useState, useEffect } from 'react';
import type { Card as CardType, MonthlyBill } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: card.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{card.name}</span>
              <span className="text-xs text-muted-foreground">
                결제일 {card.paymentDay}일
              </span>
            </div>
            {linkedAccount && (
              <span className="text-xs text-muted-foreground">
                {linkedAccount.bank} - {linkedAccount.name}
              </span>
            )}
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
            className="font-mono"
          />
          <span className="text-sm text-muted-foreground shrink-0">원</span>
        </div>
      </CardContent>
    </Card>
  );
}

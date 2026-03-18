import { useState, useEffect, useRef } from 'react';
import type { Card as CardType, MonthlyBill } from '@/types';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseAmountInput } from '@/utils/formatter';
import { useAccountStore } from '@/stores/useAccountStore';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCardLogo } from '@/utils/constants';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';

interface BillInputCardProps {
  card: CardType;
  bill?: MonthlyBill;
  previousBill?: MonthlyBill;
  onAmountChange: (cardId: string, amount: number) => void;
}

// 청구서 카드별 금액 입력 컴포넌트
// 실시간 콤마 포맷팅, 전월 금액 참조, 입력 완료 체크 표시
export function BillInputCard({
  card,
  bill,
  previousBill,
  onAmountChange,
}: BillInputCardProps) {
  const [inputValue, setInputValue] = useState(bill?.amount ? formatCurrency(bill.amount) : '');
  const [showCheck, setShowCheck] = useState(false);
  const accounts = useAccountStore((s) => s.accounts);
  const linkedAccount = accounts.find((a) => a.id === card.linkedAccountId);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currencyInput = useCurrencyInput();

  // 외부에서 bill이 변경되면 입력값 동기화
  useEffect(() => {
    if (bill?.amount) {
      setInputValue(formatCurrency(bill.amount));
    }
  }, [bill?.amount]);

  // 금액 입력 핸들러 (실시간 콤마 포맷팅 + 디바운스 저장)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = currencyInput.handleChange(e.target.value, e.target.selectionStart);
    const amount = parseAmountInput(formatted);
    setInputValue(formatted);

    // 디바운스로 store 업데이트 (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onAmountChange(card.id, amount);

      // 금액 입력 완료 시 체크 애니메이션
      if (amount > 0) {
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 1200);
      }
    }, 300);
  };

  // 포커스 해제 시 즉시 저장
  const handleBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const amount = parseAmountInput(inputValue);
    onAmountChange(card.id, amount);
  };

  const hasAmount = bill?.amount && bill.amount > 0;

  return (
    <div className={cn(
      'card-elevated p-5 press-scale transition-all',
      hasAmount && 'ring-1 ring-foreground/10',
    )}>
      <div className="flex items-center gap-3.5">
        {/* 카드사 로고 */}
        {getCardLogo(card.issuer) ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img src={getCardLogo(card.issuer)} alt={card.issuer} className="h-full w-full object-contain" />
          </div>
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white text-[11px] font-extrabold"
            style={{ backgroundColor: card.color }}
          >
            {card.issuer.slice(0, 2)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-extrabold truncate block">{card.name}</span>
          <span className="text-[12px] text-muted-foreground">
            {linkedAccount ? `${linkedAccount.bank}` : ''} · {card.paymentDay}일 결제
          </span>
        </div>
        {showCheck && (
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground/10 animate-in fade-in zoom-in duration-300">
            <Check className="h-3.5 w-3.5 text-foreground" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Input
          ref={currencyInput.ref}
          type="text"
          inputMode="numeric"
          placeholder={
            previousBill
              ? `지난달: ${formatCurrency(previousBill.amount)}`
              : '금액 입력'
          }
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="font-display tabular-nums border-border/40 bg-muted/30 text-base font-bold"
        />
        <span className="text-xs font-semibold text-muted-foreground shrink-0">원</span>
      </div>
    </div>
  );
}

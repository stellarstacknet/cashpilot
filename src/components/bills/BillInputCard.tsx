import { useState, useEffect, useRef } from 'react';
import type { Card as CardType, MonthlyBill } from '@/types';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseAmountInput } from '@/utils/formatter';
import { useAccountStore } from '@/stores/useAccountStore';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // 외부에서 bill이 변경되면 입력값 동기화
  useEffect(() => {
    if (bill?.amount) {
      setInputValue(formatCurrency(bill.amount));
    }
  }, [bill?.amount]);

  // 금액 입력 핸들러 (실시간 콤마 포맷팅 + 디바운스 저장)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const amount = parseAmountInput(raw);

    // 실시간 콤마 포맷팅 적용
    setInputValue(amount > 0 ? formatCurrency(amount) : '');

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
      'glass-elevated rounded-2xl p-4 press-scale transition-all',
      hasAmount && 'ring-1 ring-primary/15',
    )}>
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
        {/* 입력 완료 체크 애니메이션 */}
        {showCheck && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 animate-in fade-in zoom-in duration-300">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          </div>
        )}
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
          onBlur={handleBlur}
          className="font-display tabular-nums rounded-xl border-border/40 bg-muted/30 text-base font-semibold"
        />
        <span className="text-xs font-medium text-muted-foreground shrink-0">원</span>
      </div>
    </div>
  );
}

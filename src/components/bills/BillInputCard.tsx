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
      'card-elevated p-5 press-scale transition-all',
      hasAmount && 'ring-1 ring-foreground/10',
    )}>
      <div className="flex items-center gap-3.5">
        {/* 미니 카드 비주얼 */}
        <div
          className="relative h-[52px] w-[82px] shrink-0 rounded-xl overflow-hidden"
          style={{ backgroundColor: card.color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          <div className="absolute left-3 top-2.5 h-[10px] w-[14px] rounded-[2px] bg-white/40" />
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-[7px] font-bold text-white/80 tracking-wider truncate">
              {card.name}
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-bold truncate block">{card.name}</span>
          <span className="text-[12px] text-muted-foreground">
            {linkedAccount ? `${linkedAccount.bank}` : ''} · {card.paymentDay}일 결제
          </span>
        </div>
        {showCheck && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground/10 animate-in fade-in zoom-in duration-300">
            <Check className="h-3.5 w-3.5 text-foreground" />
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

// 금액 입력 시 콤마 포맷팅 + 커서 위치 보존 훅
import { useRef, useEffect, useCallback } from 'react';
import { parseAmountInput, formatCurrency } from '@/utils/formatter';

export function useCurrencyInput() {
  const ref = useRef<HTMLInputElement>(null);
  const cursorPos = useRef<number | null>(null);

  useEffect(() => {
    if (cursorPos.current !== null && ref.current) {
      ref.current.setSelectionRange(cursorPos.current, cursorPos.current);
      cursorPos.current = null;
    }
  });

  const handleChange = useCallback((
    rawValue: string,
    selectionStart: number | null,
  ): string => {
    const pos = selectionStart ?? rawValue.length;
    const commasBefore = (rawValue.slice(0, pos).match(/,/g) || []).length;
    const amount = parseAmountInput(rawValue);
    const formatted = amount > 0 ? formatCurrency(amount) : '';
    const commasAfter = (formatted.slice(0, pos).match(/,/g) || []).length;
    cursorPos.current = pos + (commasAfter - commasBefore);
    return formatted;
  }, []);

  return { ref, handleChange };
}

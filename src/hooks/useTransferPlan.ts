// 이체 플랜 자동 계산 hook
// 공휴일 보정 적용: 결제일이 주말/공휴일이면 다음 영업일로 보정
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import { calculateTransferPlan } from '@/utils/calculator';
import { useHolidays } from './useHolidays';

export function useTransferPlan(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);
  const fixedExpenses = useFixedExpenseStore((s) => s.expenses);
  const { holidays } = useHolidays(year, month);

  // 아직 빠지지 않은 계좌이체 고정비만 포함
  const pendingFixed = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const today = now.getDate();

    if (year === currentYear && month === currentMonth) {
      return fixedExpenses.filter((e) => e.payMethod === 'account' && e.accountId && e.payDay > today);
    }
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return fixedExpenses.filter((e) => e.payMethod === 'account' && e.accountId);
    }
    return [];
  }, [fixedExpenses, year, month]);

  const result = useMemo(
    () => calculateTransferPlan(accounts, cards, bills, year, month, holidays, pendingFixed),
    [accounts, cards, bills, year, month, holidays, pendingFixed],
  );

  return result;
}

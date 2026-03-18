// 이체 플랜 자동 계산 hook
// 공휴일 보정 적용: 결제일이 주말/공휴일이면 다음 영업일로 보정
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { calculateTransferPlan } from '@/utils/calculator';
import { useHolidays } from './useHolidays';

export function useTransferPlan(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);
  const { holidays } = useHolidays(year, month);

  const result = useMemo(
    () => calculateTransferPlan(accounts, cards, bills, year, month, holidays),
    [accounts, cards, bills, year, month, holidays],
  );

  return result;
}

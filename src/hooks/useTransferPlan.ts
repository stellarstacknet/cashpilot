// 이체 플랜 자동 계산 hook
// 계좌/카드/청구서 데이터를 기반으로 이체 플랜을 메모이제이션하여 반환
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { calculateTransferPlan } from '@/utils/calculator';

export function useTransferPlan(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);

  // 의존 데이터가 변경될 때만 재계산
  const result = useMemo(
    () => calculateTransferPlan(accounts, cards, bills, year, month),
    [accounts, cards, bills, year, month],
  );

  return result;
}

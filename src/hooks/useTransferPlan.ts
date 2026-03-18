import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { calculateTransferPlan } from '@/utils/calculator';

export function useTransferPlan(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);

  const result = useMemo(
    () => calculateTransferPlan(accounts, cards, bills, year, month),
    [accounts, cards, bills, year, month],
  );

  return result;
}

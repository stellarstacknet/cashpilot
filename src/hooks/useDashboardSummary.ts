import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { generateTimelineEvents } from '@/utils/calculator';

export function useDashboardSummary(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);

  const summary = useMemo(() => {
    const monthBills = bills.filter((b) => b.year === year && b.month === month);
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalBills = monthBills.reduce((sum, b) => sum + b.amount, 0);
    const remaining = totalBalance - totalBills;

    return {
      totalBalance,
      totalBills,
      remaining,
      billCount: monthBills.length,
      paidCount: monthBills.filter((b) => b.isPaid).length,
    };
  }, [accounts, bills, year, month]);

  const timelineEvents = useMemo(
    () => generateTimelineEvents(accounts, cards, bills, year, month),
    [accounts, cards, bills, year, month],
  );

  return { ...summary, timelineEvents };
}

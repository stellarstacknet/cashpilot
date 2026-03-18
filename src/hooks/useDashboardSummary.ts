// 대시보드 요약 데이터 hook
// 공휴일 보정 적용: 타임라인 이벤트의 결제일이 영업일로 보정됨
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { generateTimelineEvents } from '@/utils/calculator';
import { useHolidays } from './useHolidays';

export function useDashboardSummary(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);
  const { holidays } = useHolidays(year, month);

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
    () => generateTimelineEvents(accounts, cards, bills, year, month, holidays),
    [accounts, cards, bills, year, month, holidays],
  );

  return { ...summary, timelineEvents };
}

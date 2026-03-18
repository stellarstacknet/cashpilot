// 대시보드 요약 데이터 hook
// 총 잔액, 총 청구액, 잔여 금액, 타임라인 이벤트를 메모이제이션하여 반환
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { generateTimelineEvents } from '@/utils/calculator';

export function useDashboardSummary(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);

  // 금액 요약 계산
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

  // 타임라인 이벤트 생성 (결제일 순 정렬)
  const timelineEvents = useMemo(
    () => generateTimelineEvents(accounts, cards, bills, year, month),
    [accounts, cards, bills, year, month],
  );

  return { ...summary, timelineEvents };
}

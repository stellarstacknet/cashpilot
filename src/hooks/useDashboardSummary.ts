// 대시보드 요약 데이터 hook
// 공휴일 보정 적용: 타임라인 이벤트의 결제일이 영업일로 보정됨
import { useMemo } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import { generateTimelineEvents } from '@/utils/calculator';
import { useHolidays } from './useHolidays';

export function useDashboardSummary(year: number, month: number) {
  const accounts = useAccountStore((s) => s.accounts);
  const cards = useCardStore((s) => s.cards);
  const bills = useBillStore((s) => s.bills);
  const fixedExpenses = useFixedExpenseStore((s) => s.expenses);
  const { holidays } = useHolidays(year, month);

  // 계좌이체 고정비 중 아직 빠지지 않은 금액 (오늘 이후 결제일)
  const pendingFixedTotal = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const today = now.getDate();

    // 조회 중인 달이 현재 달일 때만 날짜 기준 필터링
    if (year === currentYear && month === currentMonth) {
      return fixedExpenses
        .filter((e) => e.payMethod === 'account' && e.accountId && e.payDay > today)
        .reduce((sum, e) => sum + e.amount, 0);
    }
    // 미래 달이면 전부, 과거 달이면 0
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return fixedExpenses
        .filter((e) => e.payMethod === 'account' && e.accountId)
        .reduce((sum, e) => sum + e.amount, 0);
    }
    return 0;
  }, [fixedExpenses, year, month]);

  const summary = useMemo(() => {
    const monthBills = bills.filter((b) => b.year === year && b.month === month);
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalBills = monthBills.reduce((sum, b) => sum + b.amount, 0) + pendingFixedTotal;
    const remaining = totalBalance - totalBills;

    return {
      totalBalance,
      totalBills,
      remaining,
      billCount: monthBills.length,
      paidCount: monthBills.filter((b) => b.isPaid).length,
    };
  }, [accounts, bills, year, month, pendingFixedTotal]);

  // 타임라인: 아직 빠지지 않은 고정비만 포함
  const pendingFixedExpenses = useMemo(() => {
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

  const timelineEvents = useMemo(
    () => generateTimelineEvents(accounts, cards, bills, year, month, holidays, pendingFixedExpenses),
    [accounts, cards, bills, year, month, holidays, pendingFixedExpenses],
  );

  return { ...summary, timelineEvents };
}

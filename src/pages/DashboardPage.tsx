// 대시보드 페이지
// 총 잔액, 청구액, 잔여금, 계좌별 현황, 결제 타임라인 표시
import { useState, useMemo, useCallback } from 'react';
import { CalendarX, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { WarningBanner } from '@/components/dashboard/WarningBanner';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { Timeline } from '@/components/dashboard/Timeline';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useTransferPlan } from '@/hooks/useTransferPlan';
import { useAccountStore } from '@/stores/useAccountStore';
import { formatYearMonth } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  monthNav: {
    year: number;
    month: number;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    goToCurrentMonth: () => void;
    isCurrentMonth: boolean;
    canGoNext: boolean;
  };
}

export function DashboardPage({ monthNav }: DashboardPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;
  const summary = useDashboardSummary(year, month);
  const { warnings } = useTransferPlan(year, month);
  const accounts = useAccountStore((s) => s.accounts);

  // 계좌별 현황 접기/펼치기
  const [accountExpandedIds, setAccountExpandedIds] = useState<Set<string>>(new Set());
  const allAccountIds = useMemo(() => accounts.map((a) => a.id), [accounts]);
  const allAccountsExpanded = allAccountIds.length > 0 && allAccountIds.every((id) => accountExpandedIds.has(id));

  const toggleAccount = useCallback((id: string) => {
    setAccountExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllAccounts = useCallback(() => {
    if (allAccountsExpanded) {
      setAccountExpandedIds(new Set());
    } else {
      setAccountExpandedIds(new Set(allAccountIds));
    }
  }, [allAccountsExpanded, allAccountIds]);

  // 타임라인 접기/펼치기
  const [timelineExpandedDays, setTimelineExpandedDays] = useState<Set<number>>(new Set());
  const allDays = useMemo(() => {
    const days = new Set<number>();
    for (const e of summary.timelineEvents) days.add(e.day);
    return Array.from(days);
  }, [summary.timelineEvents]);
  const allDaysExpanded = allDays.length > 0 && allDays.every((d) => timelineExpandedDays.has(d));

  const toggleDay = useCallback((day: number) => {
    setTimelineExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }, []);

  const toggleAllDays = useCallback(() => {
    if (allDaysExpanded) {
      setTimelineExpandedDays(new Set());
    } else {
      setTimelineExpandedDays(new Set(allDays));
    }
  }, [allDaysExpanded, allDays]);

  return (
    <div className="space-y-7">
      {/* 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-extrabold text-muted-foreground/60 tracking-wider uppercase">CASHPILOT</p>
          <h1 className="text-[22px] font-black tracking-tight mt-0.5 text-white">
            내 자산 현황
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToCurrentMonth}
            className={cn(
              'px-2.5 py-1 text-[13px] font-extrabold tabular-nums transition-colors',
              isCurrentMonth
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {month}월
          </button>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {summary.totalBills === 0 && !isCurrentMonth ? (
        <div className="card-elevated flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground empty-state-icon">
            <CalendarX className="h-8 w-8 text-background" />
          </div>
          <h3 className="text-[17px] font-extrabold">{formatYearMonth(year, month)}</h3>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            이 달의 청구서 데이터가 없습니다.
          </p>
        </div>
      ) : (
        <>
          <SummaryCards
            totalBalance={summary.totalBalance}
            totalBills={summary.totalBills}
            remaining={summary.remaining}
          />

          <WarningBanner warnings={warnings} />

          {/* 계좌별 현황 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-label">계좌별 현황</h2>
              <button
                onClick={toggleAllAccounts}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  allAccountsExpanded
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background',
                )}
              >
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            </div>
            <AccountOverview
              year={year}
              month={month}
              expandedIds={accountExpandedIds}
              onToggle={toggleAccount}
            />
          </section>

          {/* 결제 타임라인 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-label">결제 타임라인</h2>
              <button
                onClick={toggleAllDays}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  allDaysExpanded
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background',
                )}
              >
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            </div>
            <Timeline
              events={summary.timelineEvents}
              month={month}
              expandedDays={timelineExpandedDays}
              onToggleDay={toggleDay}
            />
          </section>
        </>
      )}
    </div>
  );
}

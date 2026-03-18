import { CalendarX } from 'lucide-react';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { WarningBanner } from '@/components/dashboard/WarningBanner';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { Timeline } from '@/components/dashboard/Timeline';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useTransferPlan } from '@/hooks/useTransferPlan';
import { formatWon, formatYearMonth } from '@/utils/formatter';

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
  const { warnings, savingsAvailable } = useTransferPlan(year, month);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground">CASHPILOT</p>
          <h1 className="font-display text-xl font-extrabold tracking-tight">
            내 자산 현황
          </h1>
        </div>
      </div>

      <MonthSelector
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToCurrentMonth}
        isCurrentMonth={isCurrentMonth}
        canGoNext={canGoNext}
      />

      {summary.totalBills === 0 && !isCurrentMonth ? (
        <div className="glass-elevated flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <CalendarX className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-display text-base font-semibold">{formatYearMonth(year, month)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
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

          <section>
            <p className="section-label mb-2.5">계좌별 현황</p>
            <AccountOverview year={year} month={month} />
          </section>

          <section>
            <p className="section-label mb-2.5">타임라인</p>
            <Timeline events={summary.timelineEvents} month={month} />
          </section>

          {savingsAvailable > 0 && (
            <div className="glass-elevated rounded-2xl p-5 text-center">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                저축 가능 금액: <strong className="font-display">{formatWon(savingsAvailable)}</strong>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

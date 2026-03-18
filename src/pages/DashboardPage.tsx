import { CalendarX } from 'lucide-react';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { WarningBanner } from '@/components/dashboard/WarningBanner';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { Timeline } from '@/components/dashboard/Timeline';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useTransferPlan } from '@/hooks/useTransferPlan';
import { formatWon } from '@/utils/formatter';
import { formatYearMonth } from '@/utils/formatter';

interface DashboardPageProps {
  monthNav: {
    year: number;
    month: number;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    goToCurrentMonth: () => void;
    isCurrentMonth: boolean;
  };
}

export function DashboardPage({ monthNav }: DashboardPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth } = monthNav;
  const summary = useDashboardSummary(year, month);
  const { warnings, savingsAvailable } = useTransferPlan(year, month);

  return (
    <div className="space-y-4">
      <MonthSelector
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToCurrentMonth}
        isCurrentMonth={isCurrentMonth}
      />

      {summary.totalBills === 0 && !isCurrentMonth ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <CalendarX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">{formatYearMonth(year, month)}</h3>
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

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">계좌별 현황</h3>
            <AccountOverview year={year} month={month} />
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">타임라인</h3>
            <Timeline events={summary.timelineEvents} month={month} />
          </div>

          {savingsAvailable > 0 && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 p-4 text-center">
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                저축 가능 금액: <strong>{formatWon(savingsAvailable)}</strong>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

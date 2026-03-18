import { MonthSelector } from '@/components/layout/MonthSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { WarningBanner } from '@/components/dashboard/WarningBanner';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { Timeline } from '@/components/dashboard/Timeline';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useTransferPlan } from '@/hooks/useTransferPlan';
import { formatWon } from '@/utils/formatter';

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
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 text-center">
          <p className="text-sm text-emerald-700">
            저축 가능 금액: <strong>{formatWon(savingsAvailable)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

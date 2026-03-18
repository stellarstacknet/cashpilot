import { MonthSelector } from '@/components/layout/MonthSelector';
import { TransferPlanList } from '@/components/transfer/TransferPlanList';
import { ShortageStrategy } from '@/components/transfer/ShortageStrategy';
import { useTransferPlan } from '@/hooks/useTransferPlan';

interface TransferPlanPageProps {
  monthNav: {
    year: number;
    month: number;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    goToCurrentMonth: () => void;
    isCurrentMonth: boolean;
  };
}

export function TransferPlanPage({ monthNav }: TransferPlanPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;
  const { transferPlans, warnings, savingsAvailable } = useTransferPlan(year, month);

  return (
    <div className="space-y-4">
      <MonthSelector
        year={year}
        month={month}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToCurrentMonth}
        isCurrentMonth={isCurrentMonth}
        canGoNext={canGoNext}
      />

      <ShortageStrategy warnings={warnings} savingsAvailable={savingsAvailable} />

      <TransferPlanList plans={transferPlans} />
    </div>
  );
}

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
    canGoNext: boolean;
  };
}

export function TransferPlanPage({ monthNav }: TransferPlanPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;
  const { transferPlans, warnings, savingsAvailable } = useTransferPlan(year, month);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground">TRANSFER</p>
        <h1 className="font-display text-xl font-extrabold tracking-tight">이체 플랜</h1>
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

      <ShortageStrategy warnings={warnings} savingsAvailable={savingsAvailable} />
      <TransferPlanList plans={transferPlans} />
    </div>
  );
}

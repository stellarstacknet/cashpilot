// 이체 플랜 페이지 (가운데 포인트 탭)
import { MonthSelector } from '@/components/layout/MonthSelector';
import { TransferPlanList } from '@/components/transfer/TransferPlanList';
import { ShortageStrategy } from '@/components/transfer/ShortageStrategy';
import { useTransferPlan } from '@/hooks/useTransferPlan';

interface TransferPageProps {
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

export function TransferPage({ monthNav }: TransferPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;
  const { transferPlans, warnings, savingsAvailable } = useTransferPlan(year, month);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[12px] font-bold text-muted-foreground tracking-wider uppercase">TRANSFER</p>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">이체 플랜</h1>
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
      <TransferPlanList plans={transferPlans} year={year} month={month} />
    </div>
  );
}

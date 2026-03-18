import { MonthSelector } from '@/components/layout/MonthSelector';
import { BillInputList } from '@/components/bills/BillInputList';

interface BillsPageProps {
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

export function BillsPage({ monthNav }: BillsPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground">BILLS</p>
        <h1 className="font-display text-xl font-extrabold tracking-tight">청구서 입력</h1>
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

      <BillInputList year={year} month={month} />
    </div>
  );
}

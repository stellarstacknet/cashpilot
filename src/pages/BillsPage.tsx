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
  };
}

export function BillsPage({ monthNav }: BillsPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;

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

      <BillInputList year={year} month={month} />
    </div>
  );
}

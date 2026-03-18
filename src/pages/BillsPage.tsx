// 청구서 입력 페이지
// 활성 카드별 월 청구액 입력 인터페이스
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
    <div className="space-y-7">
      <div>
        <p className="text-[12px] font-bold text-muted-foreground tracking-wider uppercase">BILLS</p>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">청구서 입력</h1>
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

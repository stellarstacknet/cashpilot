// 청구서 입력 페이지
// 활성 카드별 월 청구액 입력 인터페이스
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BillInputList } from '@/components/bills/BillInputList';
import { cn } from '@/lib/utils';

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
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground/60 tracking-wider uppercase">BILLS</p>
          <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">청구서 입력</h1>
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
              'px-2.5 py-1 rounded-lg text-[13px] font-bold tabular-nums transition-colors',
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

      <BillInputList year={year} month={month} />
    </div>
  );
}

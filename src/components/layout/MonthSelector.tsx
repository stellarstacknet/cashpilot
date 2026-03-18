// 월 선택기 컴포넌트
// 신한플레이 스타일: 큰 월 표시 + 세그먼트 화살표
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatYearMonth } from '@/utils/formatter';

interface MonthSelectorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
  isCurrentMonth?: boolean;
  canGoNext?: boolean;
}

export function MonthSelector({
  year,
  month,
  onPrev,
  onNext,
  onToday,
  isCurrentMonth,
  canGoNext = true,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between card-elevated px-4 py-3">
      <button
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5">
        <h2 className="font-display text-[17px] font-extrabold tracking-tight">
          {formatYearMonth(year, month)}
        </h2>
        {!isCurrentMonth && onToday && (
          <button
            onClick={onToday}
            className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white transition-all hover:bg-primary/90 active:scale-95"
          >
            오늘
          </button>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 active:scale-95"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

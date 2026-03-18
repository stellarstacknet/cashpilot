// 월 선택기 컴포넌트
// 이전/다음 월 이동 + "오늘" 버튼으로 현재 월 복귀
// 미래 월 접근 차단 (canGoNext prop)
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
    <div className="flex items-center justify-between">
      <button
        onClick={onPrev}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2.5">
        <h2 className="font-display text-[15px] font-bold tracking-tight">
          {formatYearMonth(year, month)}
        </h2>
        {!isCurrentMonth && onToday && (
          <button
            onClick={onToday}
            className="rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/20"
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

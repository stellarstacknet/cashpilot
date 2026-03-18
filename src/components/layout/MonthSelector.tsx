import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex items-center justify-between rounded-2xl bg-card p-2.5 border border-border/40 shadow-sm">
      <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-xl transition-all duration-200">
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2.5">
        <h2 className="font-display text-base font-bold tracking-tight">{formatYearMonth(year, month)}</h2>
        {!isCurrentMonth && onToday && (
          <Button variant="outline" size="sm" onClick={onToday} className="h-7 rounded-full px-3 text-[11px] font-medium">
            오늘
          </Button>
        )}
      </div>

      <Button variant="ghost" size="icon" onClick={onNext} disabled={!canGoNext} className="rounded-xl transition-all duration-200">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

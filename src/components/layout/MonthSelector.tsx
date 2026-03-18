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
}

export function MonthSelector({
  year,
  month,
  onPrev,
  onNext,
  onToday,
  isCurrentMonth,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-2 shadow-sm border">
      <Button variant="ghost" size="icon" onClick={onPrev} className="rounded-lg">
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold">{formatYearMonth(year, month)}</h2>
        {!isCurrentMonth && onToday && (
          <Button variant="outline" size="sm" onClick={onToday} className="h-7 rounded-full px-3 text-xs">
            오늘
          </Button>
        )}
      </div>

      <Button variant="ghost" size="icon" onClick={onNext} className="rounded-lg">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

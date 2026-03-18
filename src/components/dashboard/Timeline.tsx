import type { TimelineEvent } from '@/types';
import { formatCurrency } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface TimelineProps {
  events: TimelineEvent[];
  month: number;
}

export function Timeline({ events, month }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        이번 달 이벤트가 없습니다. 청구서를 입력하면 타임라인이 표시됩니다.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {events.map((event, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3 rounded-xl border bg-white p-3 text-sm transition-colors',
            event.isShortage && 'border-red-200 bg-red-50',
          )}
        >
          <span className="w-10 shrink-0 text-center text-xs font-medium text-muted-foreground">
            {month}/{event.day}
          </span>

          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm',
            event.type === 'income'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-rose-50 text-rose-600',
          )}>
            {event.type === 'income' ? '\u{1F4B0}' : '\u{1F4B3}'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {event.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
              )}
              <span className="truncate font-medium">{event.label}</span>
            </div>
            <span className="text-xs text-muted-foreground">{event.accountName}</span>
          </div>

          <div className="text-right">
            <span
              className={cn(
                'font-mono text-sm font-semibold',
                event.type === 'income' ? 'text-blue-600' : 'text-rose-600',
              )}
            >
              {event.type === 'income' ? '+' : '-'}
              {formatCurrency(event.amount)}
            </span>
            {event.isShortage && (
              <div className="text-[10px] text-red-600">
                {formatCurrency(Math.abs(event.balanceAfter))} 부족
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

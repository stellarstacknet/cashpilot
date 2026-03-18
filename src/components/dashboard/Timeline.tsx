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
      <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
        이번 달 이벤트가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3 rounded-2xl bg-card border border-border/40 p-4 text-sm shadow-sm transition-all duration-200 card-interactive',
            event.isShortage && 'border-red-200/60 bg-red-50 dark:border-red-900/40 dark:bg-red-950/50',
          )}
        >
          <span className="w-10 shrink-0 text-center text-[11px] font-medium text-muted-foreground tabular-nums">
            {month}/{event.day}
          </span>

          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm',
            event.type === 'income'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
              : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
          )}>
            {event.type === 'income' ? '\u{1F4B0}' : '\u{1F4B3}'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {event.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full shadow-sm"
                  style={{ backgroundColor: event.color }}
                />
              )}
              <span className="truncate font-medium text-sm">{event.label}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{event.accountName}</span>
          </div>

          <div className="text-right">
            <span
              className={cn(
                'text-sm font-semibold tabular-nums tracking-tight',
                event.type === 'income' ? 'text-blue-600 dark:text-blue-400' : 'text-red-500 dark:text-red-400',
              )}
            >
              {event.type === 'income' ? '+' : '-'}
              {formatCurrency(event.amount)}
            </span>
            {event.isShortage && (
              <div className="text-[10px] font-medium text-red-500 dark:text-red-400 mt-0.5">
                {formatCurrency(Math.abs(event.balanceAfter))} 부족
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
        이번 달 이벤트가 없습니다.
      </div>
    );
  }

  return (
    <div className="glass-elevated rounded-2xl divide-y divide-border/30">
      {events.map((event, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-3 px-4 py-3.5 transition-colors',
            i === 0 && 'rounded-t-2xl',
            i === events.length - 1 && 'rounded-b-2xl',
            event.isShortage && 'bg-rose-500/5',
          )}
        >
          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-muted/60">
            <span className="text-[10px] font-bold text-muted-foreground tabular-nums leading-none">
              {month}월
            </span>
            <span className="text-sm font-bold tabular-nums leading-tight">
              {event.day}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {event.color && (
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: event.color }} />
              )}
              <span className="truncate text-sm font-medium">{event.label}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{event.accountName}</span>
          </div>

          <div className="text-right shrink-0">
            <span className={cn(
              'text-sm font-semibold tabular-nums tracking-tight',
              event.type === 'income' ? 'amount-positive' : 'amount-negative',
            )}>
              {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}
            </span>
            {event.isShortage && (
              <p className="text-[10px] font-medium amount-negative mt-0.5">
                {formatCurrency(Math.abs(event.balanceAfter))} 부족
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

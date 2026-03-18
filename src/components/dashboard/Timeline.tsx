// 결제 타임라인 컴포넌트
// 날짜 배지 + 클린 리스트 + 금액 강조
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
      <div className="card-elevated flex flex-col items-center py-14 text-center">
        <p className="text-[14px] text-muted-foreground">이번 달 이벤트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="card-elevated overflow-hidden">
      {events.map((event, i) => (
        <div
          key={i}
          className={cn(
            'flex items-center gap-4 px-5 py-4 transition-colors',
            i !== events.length - 1 && 'border-b border-border/40',
          )}
        >
          {/* 날짜 배지 */}
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[14px] bg-muted/80">
            <span className="text-[10px] font-bold text-muted-foreground leading-none">
              {month}월
            </span>
            <span className="text-[16px] font-extrabold tabular-nums leading-tight text-foreground">
              {event.day}
            </span>
          </div>

          {/* 이벤트 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {event.color && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
              )}
              <span className="truncate text-[14px] font-semibold">{event.label}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[12px] text-muted-foreground">{event.accountName}</span>
              {event.originalDay && (
                <span className="text-[10px] text-muted-foreground/60">
                  ({event.originalDay}일→{event.day}일)
                </span>
              )}
            </div>
          </div>

          {/* 금액: +는 검정(foreground), -는 그레이(muted-foreground) */}
          <div className="text-right shrink-0">
            <span className={cn(
              'text-[15px] font-bold tabular-nums tracking-tight',
              event.type === 'income' ? 'text-foreground' : 'text-muted-foreground',
            )}>
              {event.type === 'income' ? '+' : '-'}{formatCurrency(event.amount)}원
            </span>
            {event.isShortage && (
              <p className="text-[11px] font-semibold text-muted-foreground/70 mt-0.5">
                {formatCurrency(Math.abs(event.balanceAfter))}원 부족
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

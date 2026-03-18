// 결제 타임라인 컴포넌트
// 날짜별 그룹핑 + 날짜 헤더 + 이벤트 리스트
import { useMemo } from 'react';
import type { TimelineEvent } from '@/types';
import { formatCurrency } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface TimelineProps {
  events: TimelineEvent[];
  month: number;
}

export function Timeline({ events, month }: TimelineProps) {
  // 날짜별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<number, TimelineEvent[]>();
    for (const event of events) {
      const list = map.get(event.day) || [];
      list.push(event);
      map.set(event.day, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="card-elevated flex flex-col items-center py-14 text-center">
        <p className="text-[14px] text-muted-foreground">이번 달 이벤트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grouped.map(([day, dayEvents]) => {
        const dayTotal = dayEvents.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div key={day} className="card-elevated overflow-hidden">
            {/* 날짜 헤더 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[18px] font-extrabold tabular-nums text-foreground">
                  {month}.{day}
                </span>
                {dayEvents[0]?.originalDay && (
                  <span className="text-[10px] text-muted-foreground/60">
                    ({dayEvents[0].originalDay}일에서 변경)
                  </span>
                )}
              </div>
              <span className="text-[13px] font-bold tabular-nums text-muted-foreground">
                {formatCurrency(dayTotal)}원
              </span>
            </div>

            {/* 해당 날짜 이벤트 목록 */}
            {dayEvents.map((event, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3.5 px-5 py-3.5',
                  i !== dayEvents.length - 1 && 'border-b border-border/30',
                )}
              >
                {/* 카드 색상 dot + 이벤트 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {event.color && (
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    )}
                    <span className="truncate text-[14px] font-semibold">{event.label}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 ml-4">
                    {event.accountName}
                  </p>
                </div>

                {/* 금액 */}
                <div className="text-right shrink-0">
                  <span className={cn(
                    'text-[15px] font-bold tabular-nums tracking-tight',
                    event.type === 'income' ? 'text-blue-400' : 'text-foreground',
                  )}>
                    {event.type === 'income' && '+'}{formatCurrency(event.amount)}원
                  </span>
                  {event.isShortage && (
                    <p className="text-[11px] font-semibold text-red-400 mt-0.5">
                      {formatCurrency(Math.abs(event.balanceAfter))}원 부족
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

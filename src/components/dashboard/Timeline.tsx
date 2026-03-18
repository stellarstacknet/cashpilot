// 결제 타임라인 컴포넌트
// 날짜별 그룹핑 + 접기/펼치기
import { useMemo } from 'react';
import type { TimelineEvent } from '@/types';
import { formatCurrency } from '@/utils/formatter';
import { cn } from '@/lib/utils';
import { getCardLogo } from '@/utils/constants';
import { ChevronRight } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  month: number;
  expandedDays: Set<number>;
  onToggleDay: (day: number) => void;
}

export function Timeline({ events, month, expandedDays, onToggleDay }: TimelineProps) {
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
        const isExpanded = expandedDays.has(day);

        return (
          <div key={day} className="card-elevated overflow-hidden">
            {/* 날짜 헤더 — 클릭으로 접기/펼치기 */}
            <div
              className="flex items-center justify-between px-5 py-3 cursor-pointer press-scale"
              onClick={() => onToggleDay(day)}
            >
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-black tabular-nums text-foreground">
                  {month}.{day}
                </span>
                {dayEvents[0]?.originalDay && (
                  <span className="text-[10px] text-muted-foreground/60">
                    (원래 {dayEvents[0].originalDay}일)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-extrabold tabular-nums text-muted-foreground">
                  {formatCurrency(dayTotal)}원
                </span>
                <ChevronRight className={cn(
                  'h-4 w-4 text-muted-foreground/50 transition-transform duration-200',
                  isExpanded && 'rotate-90',
                )} />
              </div>
            </div>

            {/* 접히는 이벤트 목록 */}
            <div
              className={cn(
                'grid transition-all duration-300 ease-out',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border/50">
                  {dayEvents.map((event, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-3.5 px-5 py-3.5',
                        i !== dayEvents.length - 1 && 'border-b border-border/30',
                      )}
                    >
                      {event.issuer && getCardLogo(event.issuer!) ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                          <img
                            src={getCardLogo(event.issuer!)}
                            alt=""
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[9px] font-extrabold"
                          style={{ backgroundColor: event.color || '#6B7280' }}
                        >
                          {event.label.slice(0, 2)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <span className="truncate text-[14px] font-bold block">{event.label}</span>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {event.accountName}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={cn(
                          'text-[15px] font-extrabold tabular-nums tracking-tight',
                          event.type === 'income' ? 'text-[#3a9bd5]' : 'text-foreground',
                        )}>
                          {event.type === 'income' && '+'}{formatCurrency(event.amount)}원
                        </span>
                        {event.isShortage && (
                          <p className="text-[11px] font-bold text-[#e53535] mt-0.5">
                            {formatCurrency(Math.abs(event.balanceAfter))}원 부족
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

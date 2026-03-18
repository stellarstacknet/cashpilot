// 대시보드 페이지
// 총 잔액, 청구액, 잔여금, 계좌별 현황, 결제 타임라인 표시
import { CalendarX, ChevronLeft, ChevronRight } from 'lucide-react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { WarningBanner } from '@/components/dashboard/WarningBanner';
import { AccountOverview } from '@/components/dashboard/AccountOverview';
import { Timeline } from '@/components/dashboard/Timeline';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useTransferPlan } from '@/hooks/useTransferPlan';
import { formatWon, formatYearMonth } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  monthNav: {
    year: number;
    month: number;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    goToCurrentMonth: () => void;
    isCurrentMonth: boolean;
    canGoNext: boolean;
  };
}

export function DashboardPage({ monthNav }: DashboardPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;
  const summary = useDashboardSummary(year, month);
  const { warnings, savingsAvailable } = useTransferPlan(year, month);

  return (
    <div className="space-y-7">
      {/* 헤더: 타이틀 + 인라인 월 선택 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-bold text-muted-foreground/60 tracking-wider uppercase">CASHPILOT</p>
          <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">
            내 자산 현황
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToCurrentMonth}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[13px] font-bold tabular-nums transition-colors',
              isCurrentMonth
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {month}월
          </button>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {summary.totalBills === 0 && !isCurrentMonth ? (
        <div className="card-elevated flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted empty-state-icon">
            <CalendarX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-[17px] font-bold">{formatYearMonth(year, month)}</h3>
          <p className="mt-1.5 text-[14px] text-muted-foreground">
            이 달의 청구서 데이터가 없습니다.
          </p>
        </div>
      ) : (
        <>
          <SummaryCards
            totalBalance={summary.totalBalance}
            totalBills={summary.totalBills}
            remaining={summary.remaining}
          />

          <WarningBanner warnings={warnings} />

          {/* 계좌별 현황 섹션 */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-label">계좌별 현황</h2>
              <span className="section-sub">{summary.billCount}건 청구</span>
            </div>
            <AccountOverview year={year} month={month} />
          </section>

          {/* 타임라인 섹션 */}
          <section>
            <h2 className="section-label mb-4">결제 타임라인</h2>
            <Timeline events={summary.timelineEvents} month={month} />
          </section>

          {/* 저축 가능 금액 */}
          {savingsAvailable > 0 && (
            <div className="card-elevated p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15">
                <span className="text-[13px] font-extrabold text-blue-500">저축</span>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground font-medium">저축 가능 금액</p>
                <p className="font-display text-[20px] font-extrabold tabular-nums tracking-tight text-blue-500 mt-0.5">
                  +{formatWon(savingsAvailable)}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 대시보드 요약 카드 컴포넌트
// 히어로 총 잔액 + 청구액/잔여 카드
import { formatCurrency } from '@/utils/formatter';

interface SummaryCardsProps {
  totalBalance: number;
  totalBills: number;
  remaining: number;
}

export function SummaryCards({
  totalBalance,
  totalBills,
  remaining,
}: SummaryCardsProps) {
  const usageRatio = totalBalance > 0
    ? Math.min((totalBills / totalBalance) * 100, 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* 히어로 잔액 카드 */}
      <div className="hero-gradient rounded-[24px] p-7 text-white dark:text-black">
        <div className="relative z-10">
          <p className="text-[13px] font-medium text-white/60 dark:text-black/50">
            총 자산
          </p>
          <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-tight tabular-nums animate-count">
            {formatCurrency(totalBalance)}<span className="text-[22px] font-bold text-white/70 dark:text-black/60 ml-1">원</span>
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[12px] text-white/50 dark:text-black/45 mb-1.5">
              <span>이번 달 결제 예정</span>
              <span className="tabular-nums font-semibold text-white/70 dark:text-black/60">{usageRatio.toFixed(0)}%</span>
            </div>
            <div className="h-[5px] rounded-full bg-white/15 dark:bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/60 dark:bg-black/40 transition-all duration-700 ease-out"
                style={{ width: `${usageRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 청구액/잔여 카드 2칼럼 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-elevated p-5 press-scale">
          <p className="text-[13px] font-semibold text-muted-foreground mb-3">청구액</p>
          <p className="font-display text-[22px] font-extrabold tabular-nums tracking-tight text-muted-foreground">
            {formatCurrency(totalBills)}
            <span className="text-[14px] font-bold ml-0.5">원</span>
          </p>
        </div>

        <div className="card-elevated p-5 press-scale">
          <p className="text-[13px] font-semibold text-muted-foreground mb-3">잔여</p>
          <p className="font-display text-[22px] font-extrabold tabular-nums tracking-tight text-foreground">
            {formatCurrency(Math.abs(remaining))}
            <span className="text-[14px] font-bold ml-0.5">원</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// 대시보드 요약 카드 컴포넌트
// 히어로 그라데이션 총 잔액 카드 + 청구액/잔여 2칼럼 카드
import { formatWon } from '@/utils/formatter';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

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
  return (
    <div className="space-y-3">
      <div className="hero-gradient rounded-[20px] p-6 text-white shadow-xl shadow-purple-900/25 dark:shadow-purple-900/15">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
            Total Balance
          </p>
          <p className="mt-2 font-display text-[34px] font-extrabold leading-none tracking-tight tabular-nums">
            {formatWon(totalBalance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-elevated rounded-2xl p-4 press-scale">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10">
            <ArrowUp className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">청구액</p>
          <p className="mt-1 font-display text-lg font-bold tabular-nums tracking-tight text-rose-500 dark:text-rose-400">
            {formatWon(totalBills)}
          </p>
        </div>

        <div className="glass-elevated rounded-2xl p-4 press-scale">
          <div className={cn(
            'mb-3 flex h-8 w-8 items-center justify-center rounded-xl',
            remaining >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
          )}>
            <ArrowDown className={cn(
              'h-4 w-4',
              remaining >= 0 ? 'text-emerald-500' : 'text-rose-500',
            )} />
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">잔여</p>
          <p className={cn(
            'mt-1 font-display text-lg font-bold tabular-nums tracking-tight',
            remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400',
          )}>
            {formatWon(remaining)}
          </p>
        </div>
      </div>
    </div>
  );
}

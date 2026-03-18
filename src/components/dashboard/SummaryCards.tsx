import { Wallet, CreditCard, TrendingDown } from 'lucide-react';
import { formatWon } from '@/utils/formatter';
import { cn } from '@/lib/utils';

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/20">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -right-2 top-10 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 text-sm text-blue-100/80">
            <Wallet className="h-4 w-4" />
            <span className="font-medium">총 잔액</span>
          </div>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight tabular-nums">
            {formatWon(totalBalance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-sm card-interactive">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            청구액
          </div>
          <p className="mt-2.5 font-display text-xl font-bold tracking-tight tabular-nums text-red-500 dark:text-red-400">
            {formatWon(totalBills)}
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-sm card-interactive">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5" />
            잔여
          </div>
          <p className={cn(
            'mt-2.5 font-display text-xl font-bold tracking-tight tabular-nums',
            remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
          )}>
            {formatWon(remaining)}
          </p>
        </div>
      </div>
    </div>
  );
}

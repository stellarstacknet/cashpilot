import { Wallet, CreditCard, PiggyBank } from 'lucide-react';
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
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-center gap-1.5 text-xs text-blue-100">
          <Wallet className="h-3.5 w-3.5" />
          총 잔액
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
          {formatWon(totalBalance)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" />
            청구액
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight tabular-nums text-red-500 dark:text-red-400">
            {formatWon(totalBills)}
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PiggyBank className="h-3.5 w-3.5" />
            잔여
          </div>
          <p className={cn(
            'mt-2 text-lg font-bold tracking-tight tabular-nums',
            remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
          )}>
            {formatWon(remaining)}
          </p>
        </div>
      </div>
    </div>
  );
}

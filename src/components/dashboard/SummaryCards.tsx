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
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white shadow-sm">
        <div className="flex items-center gap-1 text-[11px] text-blue-100">
          <Wallet className="h-3 w-3" />
          총 잔액
        </div>
        <p className="mt-1.5 text-sm font-bold">
          {formatWon(totalBalance)}
        </p>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-3 text-white shadow-sm">
        <div className="flex items-center gap-1 text-[11px] text-rose-100">
          <CreditCard className="h-3 w-3" />
          청구액
        </div>
        <p className="mt-1.5 text-sm font-bold">
          {formatWon(totalBills)}
        </p>
      </div>

      <div className={cn(
        'rounded-xl p-3 text-white shadow-sm',
        remaining >= 0
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          : 'bg-gradient-to-br from-red-600 to-red-700',
      )}>
        <div className={cn(
          'flex items-center gap-1 text-[11px]',
          remaining >= 0 ? 'text-emerald-100' : 'text-red-200',
        )}>
          <PiggyBank className="h-3 w-3" />
          잔여
        </div>
        <p className="mt-1.5 text-sm font-bold">
          {formatWon(remaining)}
        </p>
      </div>
    </div>
  );
}

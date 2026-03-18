// 부족 대응 전략 컴포넌트
// 잔액 부족 경고와 저축 가능 금액 표시
import { AlertTriangle } from 'lucide-react';

interface ShortageStrategyProps {
  warnings: string[];
  savingsAvailable: number;
}

export function ShortageStrategy({ warnings, savingsAvailable }: ShortageStrategyProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded-2xl bg-amber-500/8 p-4 ring-1 ring-amber-500/15 dark:bg-amber-500/5 dark:ring-amber-500/10">
      <div className="flex items-center gap-2 mb-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">부족 대응 전략</p>
      </div>
      <div className="space-y-1.5">
        {warnings.map((w, i) => (
          <p key={i} className="text-[12px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">{w}</p>
        ))}
        {savingsAvailable > 0 && (
          <p className="mt-2 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
            모든 결제 후 저축 가능 금액: {savingsAvailable.toLocaleString()}원
          </p>
        )}
      </div>
    </div>
  );
}

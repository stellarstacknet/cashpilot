// 부족 대응 전략 컴포넌트
import { AlertTriangle } from 'lucide-react';

interface ShortageStrategyProps {
  warnings: string[];
  savingsAvailable: number;
}

export function ShortageStrategy({ warnings, savingsAvailable }: ShortageStrategyProps) {
  if (warnings.length === 0) return null;

  return (
    <div className=" bg-muted/60 p-5 ring-1 ring-border">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-foreground/60" />
        <p className="text-[15px] font-extrabold text-foreground">부족 대응 전략</p>
      </div>
      <div className="space-y-1.5">
        {warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground pl-6">
            <span className="shrink-0 mt-1.5 h-1 w-1 bg-foreground/30" />
            <span>{w}</span>
          </div>
        ))}
        {savingsAvailable > 0 && (
          <p className="mt-3 pl-6 text-[13px] font-bold text-foreground">
            모든 결제 후 저축 가능 금액: {savingsAvailable.toLocaleString()}원
          </p>
        )}
      </div>
    </div>
  );
}

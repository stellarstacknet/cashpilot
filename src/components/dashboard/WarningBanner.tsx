// 잔액 부족 경고 배너 컴포넌트
// 계좌 잔액이 청구액에 미달할 때 표시
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  warnings: string[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded-2xl bg-amber-500/8 p-4 ring-1 ring-amber-500/15 dark:bg-amber-500/5 dark:ring-amber-500/10">
      {warnings.map((warning, i) => (
        <div key={i} className="flex items-start gap-2.5 text-[13px] text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{warning}</span>
        </div>
      ))}
    </div>
  );
}

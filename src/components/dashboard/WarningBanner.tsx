// 잔액 부족 경고 배너 컴포넌트
import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  warnings: string[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/20">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="text-[13px] font-bold text-red-500">주의가 필요해요</span>
      </div>
      <div className="space-y-1.5">
        {warnings.map((warning, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground pl-6">
            <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-foreground/30" />
            <span>{warning}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

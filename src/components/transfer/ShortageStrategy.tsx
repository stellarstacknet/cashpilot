import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ShortageStrategyProps {
  warnings: string[];
  savingsAvailable: number;
}

export function ShortageStrategy({ warnings, savingsAvailable }: ShortageStrategyProps) {
  if (warnings.length === 0) return null;

  return (
    <Card className="rounded-xl border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
          <AlertTriangle className="h-4 w-4" />
          부족 대응 전략
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {warnings.map((w, i) => (
          <p key={i} className="text-xs text-orange-700 dark:text-orange-400">{w}</p>
        ))}
        {savingsAvailable > 0 && (
          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
            모든 결제 후 저축 가능 금액: {savingsAvailable.toLocaleString()}원
          </p>
        )}
      </CardContent>
    </Card>
  );
}

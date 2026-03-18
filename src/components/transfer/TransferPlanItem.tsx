import type { TransferPlan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccountStore } from '@/stores/useAccountStore';
import { formatWon } from '@/utils/formatter';
import { cn } from '@/lib/utils';

interface TransferPlanItemProps {
  plan: TransferPlan;
  onMarkDone: (id: string) => void;
  onSkip: (id: string) => void;
}

export function TransferPlanItem({ plan, onMarkDone, onSkip }: TransferPlanItemProps) {
  const accounts = useAccountStore((s) => s.accounts);
  const fromAccount = accounts.find((a) => a.id === plan.fromAccountId);
  const toAccount = accounts.find((a) => a.id === plan.toAccountId);

  const priorityColor =
    plan.priority === 1
      ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
      : plan.priority <= 3
        ? 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
        : 'bg-muted text-muted-foreground border-border';

  return (
    <Card className={cn('rounded-2xl border-border/50', plan.status !== 'pending' && 'opacity-50')}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={priorityColor}>
              P{plan.priority}
            </Badge>
            {plan.status === 'done' && (
              <Badge variant="secondary">완료</Badge>
            )}
            {plan.status === 'skipped' && (
              <Badge variant="outline">건너뜀</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {plan.dueDate}일까지
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="font-medium">{fromAccount?.name || '알 수 없음'}</span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="font-medium">{toAccount?.name || '알 수 없음'}</span>
        </div>

        <p className="mt-1.5 font-mono text-xl font-bold tabular-nums tracking-tight">{formatWon(plan.amount)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{plan.reason}</p>

        {plan.status === 'pending' && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => onMarkDone(plan.id)} className="rounded-xl">
              완료 처리
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSkip(plan.id)} className="rounded-xl">
              건너뛰기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

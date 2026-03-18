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
      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800'
      : plan.priority <= 3
        ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800'
        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';

  return (
    <Card className={cn('rounded-xl', plan.status !== 'pending' && 'opacity-60')}>
      <CardContent className="p-4">
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

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-medium">{fromAccount?.name || '알 수 없음'}</span>
          <span className="text-muted-foreground">&rarr;</span>
          <span className="font-medium">{toAccount?.name || '알 수 없음'}</span>
        </div>

        <p className="mt-1 font-mono text-lg font-bold">{formatWon(plan.amount)}</p>
        <p className="mt-1 text-xs text-muted-foreground">{plan.reason}</p>

        {plan.status === 'pending' && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => onMarkDone(plan.id)} className="rounded-lg">
              완료 처리
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSkip(plan.id)} className="rounded-lg">
              건너뛰기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

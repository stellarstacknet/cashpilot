// 이체 플랜 개별 항목 컴포넌트
// 우선순위 뱃지, 출금→입금 계좌, 금액, 완료/건너뛰기 액션
import type { TransferPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { useAccountStore } from '@/stores/useAccountStore';
import { formatWon } from '@/utils/formatter';
import { cn } from '@/lib/utils';
import { ArrowRight, Check, SkipForward } from 'lucide-react';

interface TransferPlanItemProps {
  plan: TransferPlan;
  onMarkDone: (id: string) => void;
  onSkip: (id: string) => void;
}

export function TransferPlanItem({ plan, onMarkDone, onSkip }: TransferPlanItemProps) {
  const accounts = useAccountStore((s) => s.accounts);
  const fromAccount = accounts.find((a) => a.id === plan.fromAccountId);
  const toAccount = accounts.find((a) => a.id === plan.toAccountId);

  const isDone = plan.status !== 'pending';

  return (
    <div className={cn(
      'card-elevated p-5 press-scale transition-opacity',
      isDone && 'opacity-45',
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            'flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold',
            plan.priority === 1
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground',
          )}>
            {plan.priority}
          </span>
          {plan.status === 'done' && (
            <span className="flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-[10px] font-semibold text-foreground">
              <Check className="h-3 w-3" /> 완료
            </span>
          )}
          {plan.status === 'skipped' && (
            <span className="flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <SkipForward className="h-3 w-3" /> 건너뜀
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {plan.dueDate}일까지
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium truncate">{fromAccount?.name || '알 수 없음'}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="font-medium truncate">{toAccount?.name || '알 수 없음'}</span>
      </div>

      <p className="mt-1.5 font-display text-xl font-bold tabular-nums tracking-tight">
        {formatWon(plan.amount)}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{plan.reason}</p>

      {plan.status === 'pending' && (
        <div className="mt-3.5 flex gap-2">
          <Button
            size="sm"
            onClick={() => onMarkDone(plan.id)}
            className="rounded-xl bg-foreground text-background text-xs h-8 px-4 hover:bg-foreground/90"
          >
            완료 처리
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSkip(plan.id)}
            className="rounded-xl text-xs h-8 px-4"
          >
            건너뛰기
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import type { TransferPlan } from '@/types';
import { TransferPlanItem } from './TransferPlanItem';
import { formatWon } from '@/utils/formatter';
import { ArrowRightLeft } from 'lucide-react';

interface TransferPlanListProps {
  plans: TransferPlan[];
}

export function TransferPlanList({ plans: initialPlans }: TransferPlanListProps) {
  const [plans, setPlans] = useState(initialPlans);

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const handleMarkDone = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'done' as const } : p)),
    );
  };

  const handleSkip = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'skipped' as const } : p)),
    );
  };

  if (plans.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <ArrowRightLeft className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          이체가 필요하지 않습니다.
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/60">
          모든 계좌에 잔액이 충분합니다.
        </p>
      </div>
    );
  }

  const pendingCount = plans.filter((p) => p.status === 'pending').length;
  const totalAmount = plans
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-2.5">
      {plans.map((plan) => (
        <TransferPlanItem
          key={plan.id}
          plan={plan}
          onMarkDone={handleMarkDone}
          onSkip={handleSkip}
        />
      ))}

      <div className="glass-elevated rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">대기 중</p>
            <p className="text-sm font-semibold">{pendingCount}건</p>
          </div>
          <p className="font-display text-lg font-bold tabular-nums tracking-tight">
            {formatWon(totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}

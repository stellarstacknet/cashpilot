import { useState } from 'react';
import type { TransferPlan } from '@/types';
import { TransferPlanItem } from './TransferPlanItem';
import { formatWon } from '@/utils/formatter';

interface TransferPlanListProps {
  plans: TransferPlan[];
}

export function TransferPlanList({ plans: initialPlans }: TransferPlanListProps) {
  const [plans, setPlans] = useState(initialPlans);

  if (initialPlans !== plans && initialPlans.length !== plans.length) {
    setPlans(initialPlans);
  }

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
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        이체가 필요하지 않습니다. 모든 계좌에 잔액이 충분합니다.
      </div>
    );
  }

  const pendingCount = plans.filter((p) => p.status === 'pending').length;
  const totalAmount = plans
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <TransferPlanItem
          key={plan.id}
          plan={plan}
          onMarkDone={handleMarkDone}
          onSkip={handleSkip}
        />
      ))}

      <div className="rounded-xl border bg-gradient-to-r from-muted/50 to-muted/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <span>대기 중인 이체: {pendingCount}건</span>
          <span className="font-mono font-bold">{formatWon(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

import type { TransferPlan } from '@/types';
import { TransferPlanItem } from './TransferPlanItem';
import { formatWon } from '@/utils/formatter';
import { useTransferStatusStore } from '@/stores/useTransferStatusStore';
import { ArrowRightLeft } from 'lucide-react';

interface TransferPlanListProps {
  plans: TransferPlan[];
  year: number;
  month: number;
}

// 이체 플랜 목록 컴포넌트
// 상태(완료/건너뛰기)는 TransferStatusStore에 영속화
export function TransferPlanList({ plans, year, month }: TransferPlanListProps) {
  const { getStatus, setStatus } = useTransferStatusStore();

  // 영속 상태를 반영한 플랜 목록 생성
  const plansWithStatus = plans.map((plan) => ({
    ...plan,
    status: getStatus(year, month, plan.id),
  }));

  const handleMarkDone = (id: string) => {
    setStatus(year, month, id, 'done');
  };

  const handleSkip = (id: string) => {
    setStatus(year, month, id, 'skipped');
  };

  // 이체 플랜이 없는 경우 빈 상태 표시
  if (plans.length === 0) {
    return (
      <div className="card-elevated p-10 text-center">
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

  const pendingCount = plansWithStatus.filter((p) => p.status === 'pending').length;
  const totalAmount = plansWithStatus
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-2.5">
      {plansWithStatus.map((plan) => (
        <TransferPlanItem
          key={plan.id}
          plan={plan}
          onMarkDone={handleMarkDone}
          onSkip={handleSkip}
        />
      ))}

      {/* 대기 중인 이체 요약 */}
      <div className="card-elevated p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">대기 중</p>
            <p className="text-sm font-bold">{pendingCount}건</p>
          </div>
          <p className="font-display text-lg font-extrabold tabular-nums tracking-tight">
            {formatWon(totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}

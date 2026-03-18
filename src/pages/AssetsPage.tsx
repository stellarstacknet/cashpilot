// 자산 관리 페이지
// 서브 탭: 이체 플랜 | 계좌 | 카드
import { useState } from 'react';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { AccountManager } from '@/components/settings/AccountManager';
import { CardManager } from '@/components/settings/CardManager';
import { TransferPlanList } from '@/components/transfer/TransferPlanList';
import { ShortageStrategy } from '@/components/transfer/ShortageStrategy';
import { useTransferPlan } from '@/hooks/useTransferPlan';
import { cn } from '@/lib/utils';

type SubTab = 'transfer' | 'accounts' | 'cards';

interface AssetsPageProps {
  monthNav: {
    year: number;
    month: number;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    goToCurrentMonth: () => void;
    isCurrentMonth: boolean;
    canGoNext: boolean;
  };
}

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'transfer', label: '이체 플랜' },
  { id: 'accounts', label: '계좌' },
  { id: 'cards', label: '카드' },
];

export function AssetsPage({ monthNav }: AssetsPageProps) {
  const { year, month, goToPrevMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth, canGoNext } = monthNav;
  const { transferPlans, warnings, savingsAvailable } = useTransferPlan(year, month);
  const [subTab, setSubTab] = useState<SubTab>('transfer');

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[12px] font-bold text-muted-foreground tracking-wider uppercase">ASSETS</p>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">자산 관리</h1>
      </div>

      {/* 세그먼트 컨트롤 */}
      <div className="flex gap-1.5 card-elevated p-1.5">
        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={cn(
              'flex-1 rounded-[14px] py-2.5 text-[13px] font-semibold transition-all duration-200',
              subTab === id
                ? 'bg-foreground text-background shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'transfer' && (
        <div className="space-y-5">
          <MonthSelector
            year={year}
            month={month}
            onPrev={goToPrevMonth}
            onNext={goToNextMonth}
            onToday={goToCurrentMonth}
            isCurrentMonth={isCurrentMonth}
            canGoNext={canGoNext}
          />
          <ShortageStrategy warnings={warnings} savingsAvailable={savingsAvailable} />
          <TransferPlanList plans={transferPlans} year={year} month={month} />
        </div>
      )}

      {subTab === 'accounts' && <AccountManager />}
      {subTab === 'cards' && <CardManager />}
    </div>
  );
}

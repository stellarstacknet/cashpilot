// 자산 관리 페이지
// 서브 탭: 계좌 | 카드
import { useState } from 'react';
import { AccountManager } from '@/components/settings/AccountManager';
import { CardManager } from '@/components/settings/CardManager';
import { cn } from '@/lib/utils';

type SubTab = 'accounts' | 'cards';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'accounts', label: '계좌' },
  { id: 'cards', label: '카드' },
];

export function AssetsPage() {
  const [subTab, setSubTab] = useState<SubTab>('accounts');

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
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {subTab === 'accounts' && <AccountManager />}
      {subTab === 'cards' && <CardManager />}
    </div>
  );
}

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
  const tabIndex = subTab === 'accounts' ? 0 : 1;

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[12px] font-extrabold text-muted-foreground tracking-wider uppercase">ASSETS</p>
        <h1 className="text-[22px] font-black tracking-tight mt-0.5">자산 관리</h1>
      </div>

      {/* 세그먼트 컨트롤 + 슬라이딩 인디케이터 */}
      <div className="relative card-elevated p-0 overflow-hidden">
        {/* 슬라이딩 인디케이터 */}
        <div
          className="absolute top-0 bottom-0 w-1/2 bg-foreground transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${tabIndex * 100}%)` }}
        />
        <div className="relative flex">
          {SUB_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              className={cn(
                'flex-1 py-3 text-[13px] font-bold transition-colors duration-300 relative z-10',
                subTab === id
                  ? 'text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 슬라이딩 패널 */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-350 ease-out"
          style={{
            width: '200%',
            transform: `translateX(-${tabIndex * 50}%)`,
            transitionDuration: '350ms',
            transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          <div className="w-1/2 min-w-0 px-0.5">
            <AccountManager />
          </div>
          <div className="w-1/2 min-w-0 px-0.5">
            <CardManager />
          </div>
        </div>
      </div>
    </div>
  );
}

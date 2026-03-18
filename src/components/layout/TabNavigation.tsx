// 하단 플로팅 탭 네비게이션
// 활성 탭은 아이콘 + 라벨, 비활성 탭은 아이콘만 표시
// 고정 너비로 탭 전환 시 레이아웃 쉬프트 방지
import { LayoutDashboard, Receipt, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'dashboard' | 'bills' | 'assets' | 'settings';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: '홈', icon: LayoutDashboard },
  { id: 'bills', label: '청구서', icon: Receipt },
  { id: 'assets', label: '자산', icon: Wallet },
  { id: 'settings', label: '설정', icon: Settings },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 pb-safe">
      <div className="floating-nav flex items-center gap-1 rounded-2xl px-2 py-1.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-all duration-300',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 w-[88px]'
                  : 'text-muted-foreground hover:text-foreground w-11',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
              {isActive && (
                <span className="font-display text-[11px] tracking-wide whitespace-nowrap">{label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

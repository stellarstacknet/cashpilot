// 하단 플로팅 탭 네비게이션
// 블랙앤화이트: 활성 탭 foreground 강조 + 인디케이터
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
      <div className="floating-nav flex items-center gap-1.5 rounded-2xl px-2.5 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-xs transition-all duration-200',
                isActive
                  ? 'text-foreground w-[68px]'
                  : 'text-muted-foreground hover:text-foreground w-[56px]',
              )}
            >
              <Icon className={cn(
                'h-[20px] w-[20px] transition-all',
                isActive && 'stroke-[2.5]',
              )} />
              <span className={cn(
                'text-[10px] tracking-tight',
                isActive ? 'text-foreground font-bold' : 'text-muted-foreground font-semibold',
              )}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-[3px] w-5 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

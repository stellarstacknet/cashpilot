// 하단 플로팅 탭 네비게이션
// 5탭 구조, 가운데 홈 버튼 돌출 포인트 디자인
import { LayoutDashboard, Receipt, ArrowLeftRight, Wallet, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'bills' | 'transfer' | 'dashboard' | 'assets' | 'settings';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const leftTabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bills', label: '청구서', icon: Receipt },
  { id: 'transfer', label: '이체', icon: ArrowLeftRight },
];

const rightTabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'assets', label: '자산', icon: Wallet },
  { id: 'settings', label: '설정', icon: Settings },
];

function TabButton({ id, label, icon: Icon, isActive, onClick }: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      key={id}
      onClick={onClick}
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-all duration-200',
        isActive ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      <Icon className={cn(
        'h-[20px] w-[20px] transition-all',
        isActive && 'stroke-[2.5]',
      )} />
      <span className={cn(
        'text-[10px] tracking-tight',
        isActive ? 'text-foreground font-extrabold' : 'text-muted-foreground font-bold',
      )}>
        {label}
      </span>
    </button>
  );
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const isDashboardActive = activeTab === 'dashboard';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="floating-nav mx-auto flex max-w-lg items-end rounded-none border-x-0 border-b-0">
        {/* 왼쪽 2탭 */}
        {leftTabs.map(({ id, label, icon }) => (
          <TabButton
            key={id}
            id={id}
            label={label}
            icon={icon}
            isActive={activeTab === id}
            onClick={() => onTabChange(id)}
          />
        ))}

        {/* 가운데 홈 포인트 버튼 */}
        <div className="relative flex flex-1 flex-col items-center">
          <button
            onClick={() => onTabChange('dashboard')}
            className={cn(
              'relative -mt-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl shadow-lg transition-all duration-200 press-scale',
              isDashboardActive
                ? 'bg-primary text-primary-foreground shadow-primary/40'
                : 'bg-primary text-primary-foreground shadow-primary/25',
            )}
          >
            <LayoutDashboard className="h-[22px] w-[22px]" />
          </button>
          <span className={cn(
            'text-[10px] tracking-tight mt-1 mb-1.5',
            isDashboardActive ? 'text-foreground font-extrabold' : 'text-muted-foreground font-bold',
          )}>
            홈
          </span>
        </div>

        {/* 오른쪽 2탭 */}
        {rightTabs.map(({ id, label, icon }) => (
          <TabButton
            key={id}
            id={id}
            label={label}
            icon={icon}
            isActive={activeTab === id}
            onClick={() => onTabChange(id)}
          />
        ))}
      </div>
    </nav>
  );
}

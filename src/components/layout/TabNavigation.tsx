import { LayoutDashboard, Receipt, ArrowRightLeft, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'dashboard' | 'bills' | 'transfer' | 'settings';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: '홈', icon: LayoutDashboard },
  { id: 'bills', label: '청구서', icon: Receipt },
  { id: 'transfer', label: '이체', icon: ArrowRightLeft },
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
                'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', isActive && 'stroke-[2.5]')} />
              {isActive && (
                <span className="font-display text-[11px] tracking-wide">{label}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

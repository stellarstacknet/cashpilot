import { LayoutDashboard, Receipt, ArrowRightLeft, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'dashboard' | 'bills' | 'transfer' | 'history' | 'settings';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: '홈', icon: LayoutDashboard },
  { id: 'bills', label: '청구서', icon: Receipt },
  { id: 'transfer', label: '이체', icon: ArrowRightLeft },
  { id: 'history', label: '히스토리', icon: BarChart3 },
  { id: 'settings', label: '설정', icon: Settings },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-all',
              activeTab === id
                ? 'text-blue-600'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div className={cn(
              'flex items-center justify-center rounded-xl px-4 py-1 transition-all',
              activeTab === id && 'bg-blue-50 dark:bg-blue-950',
            )}>
              <Icon className={cn('h-5 w-5', activeTab === id && 'scale-105')} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

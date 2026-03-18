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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl pb-safe">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all',
              activeTab === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div className={cn(
              'flex items-center justify-center rounded-xl px-4 py-1.5 transition-all',
              activeTab === id && 'bg-primary/10',
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

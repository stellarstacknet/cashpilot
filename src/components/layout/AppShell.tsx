import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { TabNavigation, type TabId } from './TabNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { BillsPage } from '@/pages/BillsPage';
import { TransferPage } from '@/pages/TransferPage';
import { FixedExpensePage } from '@/pages/FixedExpensePage';
import { AssetsPage } from '@/pages/AssetsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';
import { useSwipe } from '@/hooks/useSwipe';
import { cn } from '@/lib/utils';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const monthNav = useMonthNavigation();
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const slideKey = useRef(0);

  // 스와이프로 월 이동 (대시보드/청구서/이체 탭에서만 작동)
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (['dashboard', 'bills', 'transfer'].includes(activeTab) && monthNav.canGoNext) {
        setSlideDirection('left');
        slideKey.current++;
        monthNav.goToNextMonth();
      }
    },
    onSwipeRight: () => {
      if (['dashboard', 'bills', 'transfer'].includes(activeTab)) {
        setSlideDirection('right');
        slideKey.current++;
        monthNav.goToPrevMonth();
      }
    },
  });

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage monthNav={monthNav} onOpenSettings={() => setShowSettings(true)} />;
      case 'bills':
        return <BillsPage monthNav={monthNav} />;
      case 'transfer':
        return <TransferPage monthNav={monthNav} />;
      case 'fixed':
        return <FixedExpensePage />;
      case 'assets':
        return <AssetsPage />;
    }
  };

  const slideClass = slideDirection === 'left'
    ? 'slide-left'
    : slideDirection === 'right'
      ? 'slide-right'
      : 'page-transition';

  return (
    <div
      className="mesh-gradient flex min-h-screen flex-col"
      {...swipeHandlers}
    >
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-6">
        <div key={`${activeTab}-${slideKey.current}`} className={slideClass}>
          {renderPage()}
        </div>
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={(tab) => {
        setSlideDirection(null);
        setActiveTab(tab);
      }} />

      {/* 설정 오버레이 */}
      <div
        className={cn(
          'fixed inset-0 z-[60] transition-all duration-300',
          showSettings ? 'visible' : 'invisible',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/50 transition-opacity duration-300',
            showSettings ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setShowSettings(false)}
        />
        <div
          className={cn(
            'absolute inset-0 transition-transform duration-300 ease-out mesh-gradient overflow-y-auto',
            showSettings ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-6">
            <div className="flex items-center justify-between mb-7">
              <div>
                <p className="text-[12px] font-extrabold text-foreground tracking-wider uppercase">SETTINGS</p>
                <h1 className="text-[22px] font-black tracking-tight mt-0.5">설정</h1>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SettingsPage />
          </div>
        </div>
      </div>
    </div>
  );
}

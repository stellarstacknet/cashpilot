import { useState, useRef } from 'react';
import { TabNavigation, type TabId } from './TabNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { BillsPage } from '@/pages/BillsPage';
import { TransferPage } from '@/pages/TransferPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';
import { useSwipe } from '@/hooks/useSwipe';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
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
        return <DashboardPage monthNav={monthNav} />;
      case 'bills':
        return <BillsPage monthNav={monthNav} />;
      case 'transfer':
        return <TransferPage monthNav={monthNav} />;
      case 'assets':
        return <AssetsPage />;
      case 'settings':
        return <SettingsPage />;
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
    </div>
  );
}

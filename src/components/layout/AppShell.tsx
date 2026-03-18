import { useState, useRef } from 'react';
import { TabNavigation, type TabId } from './TabNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { BillsPage } from '@/pages/BillsPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';
import { useSwipe } from '@/hooks/useSwipe';

// 앱 쉘 컴포넌트
// 탭 네비게이션, 월 이동, 스와이프 제스처, 페이지 전환 애니메이션 관리
export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const monthNav = useMonthNavigation();
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const slideKey = useRef(0);

  // 스와이프로 월 이동 (대시보드/청구서/자산 탭에서만 작동)
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      if (['dashboard', 'bills', 'assets'].includes(activeTab) && monthNav.canGoNext) {
        setSlideDirection('left');
        slideKey.current++;
        monthNav.goToNextMonth();
      }
    },
    onSwipeRight: () => {
      if (['dashboard', 'bills', 'assets'].includes(activeTab)) {
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
      case 'assets':
        return <AssetsPage monthNav={monthNav} />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  // 슬라이드 방향에 따른 CSS 클래스 결정
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

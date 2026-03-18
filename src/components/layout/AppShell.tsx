import { useState } from 'react';
import { TabNavigation, type TabId } from './TabNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { BillsPage } from '@/pages/BillsPage';
import { TransferPlanPage } from '@/pages/TransferPlanPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';

const PAGE_TITLES: Record<TabId, string> = {
  dashboard: '대시보드',
  bills: '청구서',
  transfer: '이체 플랜',
  history: '히스토리',
  settings: '설정',
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const monthNav = useMonthNavigation();

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage monthNav={monthNav} />;
      case 'bills':
        return <BillsPage monthNav={monthNav} />;
      case 'transfer':
        return <TransferPlanPage monthNav={monthNav} />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CashPilot
          </h1>
          <span className="text-sm font-medium text-muted-foreground">
            {PAGE_TITLES[activeTab]}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-20 pt-4">
        {renderPage()}
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

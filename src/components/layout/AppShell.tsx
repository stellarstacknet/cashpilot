import { useState } from 'react';
import { TabNavigation, type TabId } from './TabNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { BillsPage } from '@/pages/BillsPage';
import { TransferPlanPage } from '@/pages/TransferPlanPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';

const PAGE_TITLES: Record<TabId, string> = {
  dashboard: '대시보드',
  bills: '청구서',
  transfer: '이체 플랜',
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
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
          <h1 className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            CashPilot
          </h1>
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            {PAGE_TITLES[activeTab]}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-5 pb-24 pt-5">
        {renderPage()}
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

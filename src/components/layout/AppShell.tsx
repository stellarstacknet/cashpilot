import { useState } from 'react';
import { TabNavigation, type TabId } from './TabNavigation';
import { DashboardPage } from '@/pages/DashboardPage';
import { BillsPage } from '@/pages/BillsPage';
import { AssetsPage } from '@/pages/AssetsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useMonthNavigation } from '@/hooks/useMonthNavigation';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const monthNav = useMonthNavigation();

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

  return (
    <div className="mesh-gradient flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-6">
        <div key={activeTab} className="page-transition">
          {renderPage()}
        </div>
      </main>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

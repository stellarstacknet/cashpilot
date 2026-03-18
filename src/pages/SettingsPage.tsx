import { Separator } from '@/components/ui/separator';
import { AccountManager } from '@/components/settings/AccountManager';
import { CardManager } from '@/components/settings/CardManager';
import { DataManagement } from '@/components/settings/DataManagement';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <AccountManager />
      <Separator />
      <CardManager />
      <Separator />
      <DataManagement />
    </div>
  );
}

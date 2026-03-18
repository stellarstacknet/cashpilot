import { Download, LogOut, RefreshCw, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AccountManager } from '@/components/settings/AccountManager';
import { CardManager } from '@/components/settings/CardManager';
import { DataManagement } from '@/components/settings/DataManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { pullFromSupabase, pushToSupabase } from '@/lib/sync';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState } from 'react';

export function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const [syncing, setSyncing] = useState(false);
  const { canInstall, isInstalled, install } = usePWAInstall();

  const handleSync = async () => {
    setSyncing(true);
    try {
      await pushToSupabase();
      await pullFromSupabase();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {user && (
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="rounded-lg">
                <RefreshCw className={`mr-1 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                동기화
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="rounded-lg">
                <LogOut className="mr-1 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}

      {(canInstall || isInstalled) && (
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">앱 설치</p>
              <p className="text-xs text-muted-foreground">
                {isInstalled ? '이미 설치되어 있습니다' : '홈 화면에 앱을 추가합니다'}
              </p>
            </div>
            <Button
              variant={isInstalled ? 'ghost' : 'default'}
              size="sm"
              onClick={install}
              disabled={isInstalled}
              className="rounded-lg"
            >
              {isInstalled ? (
                <><Check className="mr-1 h-4 w-4" />설치됨</>
              ) : (
                <><Download className="mr-1 h-4 w-4" />설치</>
              )}
            </Button>
          </div>
        </div>
      )}

      <AccountManager />
      <Separator />
      <CardManager />
      <Separator />
      <DataManagement />
    </div>
  );
}

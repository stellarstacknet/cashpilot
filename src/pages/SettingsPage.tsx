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
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();

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

      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">앱 설치</p>
            <p className="text-xs text-muted-foreground">
              {isInstalled
                ? '이미 설치되어 있습니다'
                : isIOS
                  ? 'Safari 공유 버튼 → 홈 화면에 추가'
                  : '홈 화면에 앱을 추가합니다'}
            </p>
          </div>
          {canInstall ? (
            <Button size="sm" onClick={install} className="rounded-lg">
              <Download className="mr-1 h-4 w-4" />설치
            </Button>
          ) : isInstalled ? (
            <Button variant="ghost" size="sm" disabled className="rounded-lg">
              <Check className="mr-1 h-4 w-4" />설치됨
            </Button>
          ) : null}
        </div>
      </div>

      <AccountManager />
      <Separator />
      <CardManager />
      <Separator />
      <DataManagement />
    </div>
  );
}

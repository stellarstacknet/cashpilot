import { Download, LogOut, RefreshCw, Check, Sun, Moon, Monitor } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AccountManager } from '@/components/settings/AccountManager';
import { CardManager } from '@/components/settings/CardManager';
import { DataManagement } from '@/components/settings/DataManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { pullFromSupabase, pushToSupabase } from '@/lib/sync';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { value: 'light' as const, label: '라이트', icon: Sun },
  { value: 'dark' as const, label: '다크', icon: Moon },
  { value: 'system' as const, label: '시스템', icon: Monitor },
];

export function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const [syncing, setSyncing] = useState(false);
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const { theme, setTheme } = useTheme();

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
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="rounded-xl">
                <RefreshCw className={`mr-1 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                동기화
              </Button>
              <Button variant="outline" size="sm" onClick={signOut} className="rounded-xl">
                <LogOut className="mr-1 h-4 w-4" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
        <p className="text-sm font-medium mb-3">테마</p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all duration-200',
                theme === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm">
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
            <Button size="sm" onClick={install} className="rounded-xl">
              <Download className="mr-1 h-4 w-4" />설치
            </Button>
          ) : isInstalled ? (
            <Button variant="ghost" size="sm" disabled className="rounded-xl">
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

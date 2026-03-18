import { Download, LogOut, RefreshCw, Check, Sun, Moon, Monitor, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataManagement } from '@/components/settings/DataManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { pullFromSupabase, pushToSupabase } from '@/lib/sync';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useTheme } from '@/hooks/useTheme';
import { getNotificationStatus, requestNotificationPermission } from '@/utils/notifications';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// 테마 선택 옵션
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
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus);

  // Supabase 동기화 처리
  const handleSync = async () => {
    setSyncing(true);
    try {
      await pushToSupabase();
      await pullFromSupabase();
    } finally {
      setSyncing(false);
    }
  };

  // 알림 권한 요청
  const handleEnableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground">SETTINGS</p>
        <h1 className="font-display text-xl font-extrabold tracking-tight">설정</h1>
      </div>

      {/* 사용자 프로필 + 동기화 */}
      {user && (
        <div className="glass-elevated rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary">
              {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3.5 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 rounded-xl border-border/40 text-xs h-9"
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', syncing && 'animate-spin')} />
              동기화
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="rounded-xl border-border/40 text-xs h-9"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              로그아웃
            </Button>
          </div>
        </div>
      )}

      {/* 테마 설정 */}
      <div className="glass-elevated rounded-2xl p-4">
        <p className="text-sm font-semibold mb-3">테마</p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-medium transition-all duration-200',
                theme === value
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="glass-elevated rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">결제일 알림</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {notifStatus === 'granted'
                ? 'D-3, D-1에 알림을 받습니다'
                : notifStatus === 'denied'
                  ? '브라우저 설정에서 알림을 허용해주세요'
                  : notifStatus === 'unsupported'
                    ? '이 브라우저에서 알림을 지원하지 않습니다'
                    : '결제일 전 알림을 받을 수 있습니다'}
            </p>
          </div>
          {notifStatus === 'granted' ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Bell className="h-3.5 w-3.5" /> 활성
            </span>
          ) : notifStatus === 'default' ? (
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 text-xs h-8"
            >
              <Bell className="mr-1.5 h-3.5 w-3.5" /> 허용
            </Button>
          ) : notifStatus === 'denied' ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <BellOff className="h-3.5 w-3.5" /> 차단됨
            </span>
          ) : null}
        </div>
      </div>

      {/* PWA 설치 */}
      <div className="glass-elevated rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">앱 설치</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isInstalled
                ? '이미 설치되어 있습니다'
                : isIOS
                  ? 'Safari 공유 버튼 → 홈 화면에 추가'
                  : '홈 화면에 앱을 추가합니다'}
            </p>
          </div>
          {canInstall ? (
            <Button
              size="sm"
              onClick={install}
              className="rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 text-xs h-8"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />설치
            </Button>
          ) : isInstalled ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3.5 w-3.5" />설치됨
            </span>
          ) : null}
        </div>
      </div>

      {/* 데이터 관리 */}
      <section>
        <p className="section-label mb-2.5">데이터</p>
        <DataManagement />
      </section>
    </div>
  );
}

import { Download, LogOut, RefreshCw, Check, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataManagement } from '@/components/settings/DataManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { pullFromSupabase, pushToSupabase } from '@/lib/sync';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { getNotificationStatus, requestNotificationPermission } from '@/utils/notifications';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const [syncing, setSyncing] = useState(false);
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await pushToSupabase();
      await pullFromSupabase();
    } finally {
      setSyncing(false);
    }
  };

  const handleEnableNotifications = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
  }, []);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[12px] font-bold text-foreground tracking-wider uppercase">SETTINGS</p>
        <h1 className="text-[22px] font-extrabold tracking-tight mt-0.5">설정</h1>
      </div>

      {/* 사용자 프로필 + 동기화 */}
      {user && (
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/10 font-display text-base font-bold text-foreground">
              {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold truncate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 rounded-xl text-[13px] h-10"
            >
              <RefreshCw className={cn('mr-1.5 h-4 w-4', syncing && 'animate-spin')} />
              동기화
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="rounded-xl text-[13px] h-10"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      )}

      {/* 알림 설정 */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold">결제일 알림</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
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
            <span className="status-badge bg-muted text-foreground">
              <Bell className="h-3.5 w-3.5" /> 활성
            </span>
          ) : notifStatus === 'default' ? (
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className="rounded-xl bg-primary text-primary-foreground text-[13px] h-9"
            >
              <Bell className="mr-1.5 h-3.5 w-3.5" /> 허용
            </Button>
          ) : notifStatus === 'denied' ? (
            <span className="status-badge bg-muted text-muted-foreground">
              <BellOff className="h-3.5 w-3.5" /> 차단됨
            </span>
          ) : null}
        </div>
      </div>

      {/* PWA 설치 */}
      <div className="card-elevated p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold">앱 설치</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
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
              className="rounded-xl bg-primary text-primary-foreground text-[13px] h-9"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />설치
            </Button>
          ) : isInstalled ? (
            <span className="status-badge bg-muted text-foreground">
              <Check className="h-3.5 w-3.5" />설치됨
            </span>
          ) : null}
        </div>
      </div>

      {/* 데이터 관리 */}
      <section>
        <h2 className="section-label mb-4">데이터</h2>
        <DataManagement />
      </section>
    </div>
  );
}

import { Download, LogOut, RefreshCw, Check, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataManagement } from '@/components/settings/DataManagement';
import { useAuthStore } from '@/stores/useAuthStore';
import { loadFromSupabase } from '@/lib/sync';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { getNotificationStatus, requestNotificationPermission } from '@/utils/notifications';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await loadFromSupabase();
      if (!result.success) {
        setSyncMessage({ type: 'error', text: result.error });
      } else {
        setSyncMessage({ type: 'success', text: '서버에서 불러왔어요' });
        setTimeout(() => setSyncMessage(null), 3000);
      }
    } catch (e) {
      setSyncMessage({ type: 'error', text: e instanceof Error ? e.message : '알 수 없는 오류' });
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
      {/* 사용자 프로필 + 동기화 */}
      {user && (
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground font-display text-base font-extrabold text-background">
              {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-extrabold truncate">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-[12px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          {syncMessage && (
            <p className={cn(
              'mt-3 text-[12px] font-semibold text-center',
              syncMessage.type === 'success' ? 'text-[#3a9bd5]' : 'text-[#e53535]',
            )}>
              {syncMessage.text}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 bg-foreground text-background hover:bg-foreground/90 text-[13px] h-10"
            >
              <RefreshCw className={cn('mr-1.5 h-4 w-4', syncing && 'animate-spin')} />
              서버에서 불러오기
            </Button>
            <Button
              size="sm"
              onClick={signOut}
              className="bg-foreground text-background hover:bg-foreground/90 text-[13px] h-10"
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
            <p className="text-[15px] font-extrabold">결제일 알림</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {notifStatus === 'granted'
                ? 'D-3, D-1에 알림을 보내드려요'
                : notifStatus === 'denied'
                  ? '브라우저 설정에서 알림을 허용하세요'
                  : notifStatus === 'unsupported'
                    ? '이 브라우저는 알림을 지원하지 않아요'
                    : '결제일 전 알림을 받을 수 있어요'}
            </p>
          </div>
          {notifStatus === 'granted' ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-[13px] font-extrabold text-background">
              <Bell className="h-4 w-4" /> 활성
            </span>
          ) : notifStatus === 'default' ? (
            <Button
              size="sm"
              onClick={handleEnableNotifications}
              className=" bg-primary text-primary-foreground text-[13px] h-9"
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
            <p className="text-[15px] font-extrabold">앱 설치</p>
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
              className=" bg-primary text-primary-foreground text-[13px] h-9"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />설치
            </Button>
          ) : isInstalled ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-[13px] font-extrabold text-background">
              <Check className="h-4 w-4" />설치됨
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

// CashPilot 최상위 앱 컴포넌트
// 인증 확인 → 로그인/메인 화면 분기
// Supabase 동기화 및 결제일 알림 스케줄러 초기화
import { useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/components/auth/LoginPage';
import { useAuthStore } from '@/stores/useAuthStore';
import { pullFromSupabase, setupAutoSync } from '@/lib/sync';
import { startNotificationScheduler } from '@/utils/notifications';

function App() {
  const { user, loading, initialize } = useAuthStore();

  // 앱 로드 시 인증 세션 확인
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 로그인 후 Supabase 데이터 동기화 + 자동 동기화 설정
  useEffect(() => {
    if (user) {
      pullFromSupabase().then(() => {
        setupAutoSync();
      });
    }
  }, [user]);

  // 결제일 알림 스케줄러 시작
  useEffect(() => {
    if (user) {
      startNotificationScheduler();
    }
  }, [user]);

  // 인증 확인 중 로딩 화면
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-primary font-display">
            CashPilot
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 미인증 시 로그인 페이지
  if (!user) {
    return <LoginPage />;
  }

  // 인증 완료 시 메인 앱
  return <AppShell />;
}

export default App;

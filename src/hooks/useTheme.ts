// 테마 관리 hook
// 라이트/다크/시스템 모드 전환, localStorage에 영속화
// 시스템 모드 선택 시 OS 설정 변경을 실시간 감지
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

// OS의 다크모드 설정 확인
function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// HTML root에 dark 클래스를 토글하고 theme-color 메타 태그 업데이트
function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const isDark = resolved === 'dark';
  document.documentElement.classList.toggle('dark', isDark);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#030712' : '#f8fafc');
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('cashpilot-theme') as Theme) || 'system';
  });

  // 테마 변경 시 즉시 적용
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // 시스템 모드일 때 OS 설정 변경 감지
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem('cashpilot-theme', t);
    setThemeState(t);
  };

  return { theme, setTheme };
}

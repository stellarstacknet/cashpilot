// PWA 설치 프롬프트 관리 hook
// beforeinstallprompt 이벤트 캡처, 설치 상태 감지, iOS 별도 처리
import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

// iOS 디바이스 판별
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

// 독립 실행 모드(PWA 설치됨) 판별
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => window.__pwaInstallPrompt ?? null,
  );
  const [isInstalled, setIsInstalled] = useState(isStandalone);

  useEffect(() => {
    if (isInstalled) return;

    // 설치 가능 이벤트 캡처
    const handler = (e: Event) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 설치 완료 이벤트 감지
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaInstallPrompt = null;
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInstalled]);

  // 설치 프롬프트 실행
  const install = useCallback(async () => {
    const prompt = deferredPrompt ?? window.__pwaInstallPrompt;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    window.__pwaInstallPrompt = null;
  }, [deferredPrompt]);

  return {
    canInstall: (!!deferredPrompt || !!window.__pwaInstallPrompt) && !isInstalled,
    isInstalled,
    isIOS: isIOS() && !isInstalled,
    install,
  };
}

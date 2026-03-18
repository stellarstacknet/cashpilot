import { useRef, useCallback } from 'react';

// 스와이프 제스처 감지 hook
// 좌우 스와이프로 월 이동 기능 제공
interface UseSwipeOptions {
  onSwipeLeft?: () => void;   // 왼쪽으로 스와이프 → 다음 달
  onSwipeRight?: () => void;  // 오른쪽으로 스와이프 → 이전 달
  threshold?: number;         // 스와이프 감지 최소 거리 (px)
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }: UseSwipeOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;

    const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

    // 수직 스크롤이 더 큰 경우 무시
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStart.current = null;
      return;
    }

    // 최소 거리 이상일 때만 스와이프로 인식
    if (Math.abs(deltaX) >= threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }

    touchStart.current = null;
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}

import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

// 알림 권한 상태 조회
export function getNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// 결제일 알림 스케줄링
// D-3, D-1에 알림을 보내기 위해 매일 확인하는 방식
export function checkAndNotify(): void {
  const status = getNotificationStatus();
  if (status !== 'granted') return;

  const now = new Date();
  const today = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const cards = useCardStore.getState().cards.filter((c) => c.isActive);
  const bills = useBillStore.getState().bills;

  // 현재 월의 청구서가 있는 카드만 대상
  const monthBills = bills.filter(
    (b) => b.year === currentYear && b.month === currentMonth && !b.isPaid,
  );

  for (const card of cards) {
    const bill = monthBills.find((b) => b.cardId === card.id);
    if (!bill || bill.amount === 0) continue;

    const daysUntil = card.paymentDay - today;

    // D-3 알림
    if (daysUntil === 3) {
      showNotification(
        `${card.name} 결제 D-3`,
        `${card.paymentDay}일 결제 예정: ${bill.amount.toLocaleString()}원`,
      );
    }

    // D-1 알림
    if (daysUntil === 1) {
      showNotification(
        `${card.name} 내일 결제!`,
        `${card.paymentDay}일 결제 예정: ${bill.amount.toLocaleString()}원`,
      );
    }

    // 당일 알림
    if (daysUntil === 0) {
      showNotification(
        `${card.name} 오늘 결제일`,
        `결제 금액: ${bill.amount.toLocaleString()}원`,
      );
    }
  }
}

// 알림 표시
function showNotification(title: string, body: string): void {
  // 같은 알림 중복 방지 (localStorage에 날짜별 기록)
  const key = `cashpilot-notif-${new Date().toISOString().slice(0, 10)}-${title}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');

  new Notification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: title,
  });
}

// 알림 스케줄러 시작 (1시간마다 체크)
let notificationInterval: ReturnType<typeof setInterval> | null = null;

export function startNotificationScheduler(): void {
  if (notificationInterval) return;

  // 즉시 한번 체크
  checkAndNotify();

  // 1시간마다 체크
  notificationInterval = setInterval(checkAndNotify, 60 * 60 * 1000);
}

export function stopNotificationScheduler(): void {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

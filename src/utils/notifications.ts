import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { getCachedHolidays, fetchHolidays, adjustToBusinessDay } from './holidays';

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
// 공휴일 보정된 실제 결제일 기준으로 D-3, D-1 알림
export async function checkAndNotify(): Promise<void> {
  const status = getNotificationStatus();
  if (status !== 'granted') return;

  const now = new Date();
  const today = now.getDate();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const cards = useCardStore.getState().cards.filter((c) => c.isActive);
  const bills = useBillStore.getState().bills;

  // 공휴일 데이터 확보
  let holidays = getCachedHolidays(currentYear);
  if (holidays.length === 0) {
    holidays = await fetchHolidays(currentYear);
  }

  const monthBills = bills.filter(
    (b) => b.year === currentYear && b.month === currentMonth && !b.isPaid,
  );

  for (const card of cards) {
    const bill = monthBills.find((b) => b.cardId === card.id);
    if (!bill || bill.amount === 0) continue;

    // 공휴일 보정된 실제 결제일
    const adjustedDay = adjustToBusinessDay(currentYear, currentMonth, card.paymentDay, holidays);
    const daysUntil = adjustedDay - today;

    // D-3 알림
    if (daysUntil === 3) {
      showNotification(
        `${card.name} 결제 D-3`,
        `${adjustedDay}일 결제 예정: ${bill.amount.toLocaleString()}원`,
      );
    }

    // D-1 알림
    if (daysUntil === 1) {
      showNotification(
        `${card.name} 내일 결제!`,
        `${adjustedDay}일 결제 예정: ${bill.amount.toLocaleString()}원`,
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

  checkAndNotify();

  notificationInterval = setInterval(() => { checkAndNotify(); }, 60 * 60 * 1000);
}

export function stopNotificationScheduler(): void {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

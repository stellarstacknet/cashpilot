// Supabase 데이터 동기화 모듈
// 계좌/카드/청구서를 Supabase와 양방향 동기화
// store 변경 시 자동 동기화 (1.5초 디바운스)
import { supabase } from './supabase';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import type { Account, Card, MonthlyBill } from '@/types';

// Supabase → 로컬 store로 데이터 가져오기
export async function pullFromSupabase() {
  if (!navigator.onLine) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 모든 테이블 병렬 조회
  const [accountsRes, cardsRes, billsRes] = await Promise.all([
    supabase.from('accounts').select('*').order('sort_order'),
    supabase.from('cards').select('*').order('created_at'),
    supabase.from('bills').select('*'),
  ]);

  // Supabase snake_case → 로컬 camelCase 변환 후 store 업데이트
  if (accountsRes.data) {
    const accounts: Account[] = accountsRes.data.map((a) => ({
      id: a.id,
      bank: a.bank,
      balance: Number(a.balance),
      purpose: a.purpose,
      sortOrder: a.sort_order,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
    useAccountStore.setState({ accounts });
  }

  if (cardsRes.data) {
    const cards: Card[] = cardsRes.data.map((c, i) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      paymentDay: c.payment_day,
      linkedAccountId: c.linked_account_id,
      overdueRate: Number(c.overdue_rate),
      color: c.color,
      isActive: c.is_active,
      sortOrder: c.sort_order ?? i,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    useCardStore.setState({ cards });
  }

  if (billsRes.data) {
    const bills: MonthlyBill[] = billsRes.data.map((b) => ({
      id: b.id,
      cardId: b.card_id,
      year: b.year,
      month: b.month,
      amount: Number(b.amount),
      isPaid: b.is_paid,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));
    useBillStore.setState({ bills });
  }
}

// 로컬 store → Supabase로 데이터 올리기
export async function pushToSupabase() {
  if (!navigator.onLine) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const accounts = useAccountStore.getState().accounts;
  const cards = useCardStore.getState().cards;
  const bills = useBillStore.getState().bills;

  // 계좌 upsert (camelCase → snake_case 변환)
  for (const a of accounts) {
    await supabase.from('accounts').upsert({
      id: a.id,
      user_id: user.id,
      bank: a.bank,
      balance: a.balance,
      purpose: a.purpose,
      sort_order: a.sortOrder,
    }, { onConflict: 'id' });
  }

  // 카드 upsert
  for (const c of cards) {
    await supabase.from('cards').upsert({
      id: c.id,
      user_id: user.id,
      name: c.name,
      issuer: c.issuer,
      payment_day: c.paymentDay,
      linked_account_id: c.linkedAccountId,
      overdue_rate: c.overdueRate,
      color: c.color,
      is_active: c.isActive,
    }, { onConflict: 'id' });
  }

  // 청구서 upsert
  for (const b of bills) {
    await supabase.from('bills').upsert({
      id: b.id,
      user_id: user.id,
      card_id: b.cardId,
      year: b.year,
      month: b.month,
      amount: b.amount,
      is_paid: b.isPaid,
    }, { onConflict: 'id' });
  }
}

// ── 자동 동기화 설정 ──

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

// 1.5초 디바운스로 push 실행
function debouncedSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushToSupabase();
  }, 1500);
}

// 구독 해제 함수 목록 (중복 구독 방지)
let unsubscribers: (() => void)[] = [];

// store 변경 시 자동 동기화 구독 설정
export function setupAutoSync() {
  // 기존 구독 해제 후 재등록
  unsubscribers.forEach((unsub) => unsub());
  unsubscribers = [
    useAccountStore.subscribe(debouncedSync),
    useCardStore.subscribe(debouncedSync),
    useBillStore.subscribe(debouncedSync),
  ];
}

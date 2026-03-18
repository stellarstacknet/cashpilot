import { supabase } from './supabase';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import type { Account, Card, MonthlyBill } from '@/types';

// DB → 로컬 스토어로 데이터 로드
export async function pullFromSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const [accountsRes, cardsRes, billsRes] = await Promise.all([
    supabase.from('accounts').select('*').order('sort_order'),
    supabase.from('cards').select('*').order('created_at'),
    supabase.from('bills').select('*'),
  ]);

  if (accountsRes.data) {
    const accounts: Account[] = accountsRes.data.map((a) => ({
      id: a.id,
      name: a.name,
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
    const cards: Card[] = cardsRes.data.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      paymentDay: c.payment_day,
      linkedAccountId: c.linked_account_id,
      overdueRate: Number(c.overdue_rate),
      color: c.color,
      isActive: c.is_active,
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

// 로컬 스토어 → DB로 데이터 푸시
export async function pushToSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const accounts = useAccountStore.getState().accounts;
  const cards = useCardStore.getState().cards;
  const bills = useBillStore.getState().bills;

  // 계좌 동기화
  for (const a of accounts) {
    await supabase.from('accounts').upsert({
      id: a.id,
      user_id: user.id,
      name: a.name,
      bank: a.bank,
      balance: a.balance,
      purpose: a.purpose,
      sort_order: a.sortOrder,
    }, { onConflict: 'id' });
  }

  // 카드 동기화
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

  // 청구서 동기화
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

// 스토어 변경 감지 → 자동 동기화
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function debouncedSync() {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    pushToSupabase();
  }, 1500);
}

export function setupAutoSync() {
  useAccountStore.subscribe(debouncedSync);
  useCardStore.subscribe(debouncedSync);
  useBillStore.subscribe(debouncedSync);
}

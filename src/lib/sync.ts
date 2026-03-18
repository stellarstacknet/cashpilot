// Supabase 데이터 로드
// 앱 시작 시 또는 수동 새로고침 시 Supabase → 로컬 store 동기화
import { supabase } from './supabase';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCardStore } from '@/stores/useCardStore';
import { useBillStore } from '@/stores/useBillStore';
import { useFixedExpenseStore } from '@/stores/useFixedExpenseStore';
import type { Account, Card, MonthlyBill, FixedExpense } from '@/types';

export type SyncResult = { success: true } | { success: false; error: string };

// Supabase에서 모든 데이터 불러오기
export async function loadFromSupabase(): Promise<SyncResult> {
  if (!navigator.onLine) return { success: false, error: '오프라인 상태입니다' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: '로그인이 필요합니다' };

    const [accountsRes, cardsRes, billsRes, fixedRes] = await Promise.all([
      supabase.from('accounts').select('*').order('sort_order'),
      supabase.from('cards').select('*').order('sort_order'),
      supabase.from('bills').select('*'),
      supabase.from('fixed_expenses').select('*').order('sort_order'),
    ]);

    const firstError = [accountsRes, cardsRes, billsRes, fixedRes].find((r) => r.error);
    if (firstError?.error) {
      throw firstError.error;
    }

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

    if (fixedRes.data) {
      const expenses: FixedExpense[] = fixedRes.data.map((f) => ({
        id: f.id,
        name: f.name,
        amount: Number(f.amount),
        category: f.category,
        payMethod: f.pay_method,
        cardId: f.card_id || undefined,
        accountId: f.account_id || undefined,
        payDay: f.pay_day,
        sortOrder: f.sort_order,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      }));
      useFixedExpenseStore.setState({ expenses });
    }

    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    const msg = err.message || '데이터 불러오기 실패';
    console.error('[Sync] Load error:', msg);
    return { success: false, error: msg };
  }
}

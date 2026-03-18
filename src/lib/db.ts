// Supabase 직접 CRUD 헬퍼
// 각 store 액션에서 호출하여 실시간 DB 저장
import { supabase } from './supabase';
import type { Account, Card, MonthlyBill, FixedExpense } from '@/types';

async function getUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// 공통 upsert 래퍼 (에러 로깅 + select로 결과 검증)
async function dbUpsert(table: string, row: Record<string, unknown>) {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.warn(`[DB] ${table}: 로그인 안 됨, 저장 건너뜀`);
      return;
    }
    const { data, error } = await supabase
      .from(table)
      .upsert({ ...row, user_id: userId }, { onConflict: 'id' })
      .select('id');
    if (error) {
      console.error(`[DB] ${table} upsert 실패:`, error.message, error.details);
    } else {
      console.log(`[DB] ${table} 저장 완료:`, data?.length, '건');
    }
  } catch (e) {
    console.error(`[DB] ${table} 저장 예외:`, e);
  }
}

async function dbBatchUpsert(table: string, rows: Record<string, unknown>[]) {
  try {
    const userId = await getUserId();
    if (!userId) return;
    const withUser = rows.map((r) => ({ ...r, user_id: userId }));
    const { error } = await supabase.from(table).upsert(withUser, { onConflict: 'id' });
    if (error) console.error(`[DB] ${table} batch upsert 실패:`, error.message);
  } catch (e) {
    console.error(`[DB] ${table} batch 예외:`, e);
  }
}

async function dbDelete(table: string, id: string) {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error(`[DB] ${table} delete 실패:`, error.message);
  } catch (e) {
    console.error(`[DB] ${table} delete 예외:`, e);
  }
}

// ── Accounts ──

export function dbSaveAccount(account: Account) {
  dbUpsert('accounts', {
    id: account.id,
    name: account.bank,
    bank: account.bank,
    balance: account.balance,
    purpose: account.purpose,
    sort_order: account.sortOrder,
  });
}

export function dbSaveAccounts(accounts: Account[]) {
  dbBatchUpsert('accounts', accounts.map((a) => ({
    id: a.id,
    name: a.bank,
    bank: a.bank,
    balance: a.balance,
    purpose: a.purpose,
    sort_order: a.sortOrder,
  })));
}

export function dbDeleteAccount(id: string) {
  dbDelete('accounts', id);
}

// ── Cards ──

export function dbSaveCard(card: Card) {
  dbUpsert('cards', {
    id: card.id,
    name: card.name,
    issuer: card.issuer,
    payment_day: card.paymentDay,
    linked_account_id: card.linkedAccountId,
    overdue_rate: card.overdueRate,
    color: card.color,
    is_active: card.isActive,
    sort_order: card.sortOrder,
  });
}

export function dbSaveCards(cards: Card[]) {
  dbBatchUpsert('cards', cards.map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer,
    payment_day: c.paymentDay,
    linked_account_id: c.linkedAccountId,
    overdue_rate: c.overdueRate,
    color: c.color,
    is_active: c.isActive,
    sort_order: c.sortOrder,
  })));
}

export function dbDeleteCard(id: string) {
  dbDelete('cards', id);
}

// ── Bills ──

export function dbSaveBill(bill: MonthlyBill) {
  dbUpsert('bills', {
    id: bill.id,
    card_id: bill.cardId,
    year: bill.year,
    month: bill.month,
    amount: bill.amount,
    is_paid: bill.isPaid,
  });
}

export function dbDeleteBill(id: string) {
  dbDelete('bills', id);
}

// ── Fixed Expenses ──

export function dbSaveFixedExpense(expense: FixedExpense) {
  dbUpsert('fixed_expenses', {
    id: expense.id,
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    pay_method: expense.payMethod,
    card_id: expense.cardId || null,
    account_id: expense.accountId || null,
    pay_day: expense.payDay,
    sort_order: expense.sortOrder,
  });
}

export function dbSaveFixedExpenses(expenses: FixedExpense[]) {
  dbBatchUpsert('fixed_expenses', expenses.map((f) => ({
    id: f.id,
    name: f.name,
    amount: f.amount,
    category: f.category,
    pay_method: f.payMethod,
    card_id: f.cardId || null,
    account_id: f.accountId || null,
    pay_day: f.payDay,
    sort_order: f.sortOrder,
  })));
}

export function dbDeleteFixedExpense(id: string) {
  dbDelete('fixed_expenses', id);
}

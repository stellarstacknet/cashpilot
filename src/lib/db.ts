// Supabase 직접 CRUD 헬퍼
// 각 store 액션에서 호출하여 실시간 DB 저장
import { supabase } from './supabase';
import type { Account, Card, MonthlyBill, FixedExpense } from '@/types';

async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ── Accounts ──

export function dbSaveAccount(account: Account) {
  getUserId().then((userId) => {
    if (!userId) return;
    supabase.from('accounts').upsert({
      id: account.id,
      user_id: userId,
      name: account.bank,
      bank: account.bank,
      balance: account.balance,
      purpose: account.purpose,
      sort_order: account.sortOrder,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] accounts upsert:', error.message);
    });
  });
}

export function dbSaveAccounts(accounts: Account[]) {
  getUserId().then((userId) => {
    if (!userId) return;
    const rows = accounts.map((a) => ({
      id: a.id,
      user_id: userId,
      name: a.bank,
      bank: a.bank,
      balance: a.balance,
      purpose: a.purpose,
      sort_order: a.sortOrder,
    }));
    supabase.from('accounts').upsert(rows, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] accounts batch upsert:', error.message);
    });
  });
}

export function dbDeleteAccount(id: string) {
  supabase.from('accounts').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('[DB] accounts delete:', error.message);
  });
}

// ── Cards ──

export function dbSaveCard(card: Card) {
  getUserId().then((userId) => {
    if (!userId) return;
    supabase.from('cards').upsert({
      id: card.id,
      user_id: userId,
      name: card.name,
      issuer: card.issuer,
      payment_day: card.paymentDay,
      linked_account_id: card.linkedAccountId,
      overdue_rate: card.overdueRate,
      color: card.color,
      is_active: card.isActive,
      sort_order: card.sortOrder,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] cards upsert:', error.message);
    });
  });
}

export function dbSaveCards(cards: Card[]) {
  getUserId().then((userId) => {
    if (!userId) return;
    const rows = cards.map((c) => ({
      id: c.id,
      user_id: userId,
      name: c.name,
      issuer: c.issuer,
      payment_day: c.paymentDay,
      linked_account_id: c.linkedAccountId,
      overdue_rate: c.overdueRate,
      color: c.color,
      is_active: c.isActive,
      sort_order: c.sortOrder,
    }));
    supabase.from('cards').upsert(rows, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] cards batch upsert:', error.message);
    });
  });
}

export function dbDeleteCard(id: string) {
  supabase.from('cards').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('[DB] cards delete:', error.message);
  });
}

// ── Bills ──

export function dbSaveBill(bill: MonthlyBill) {
  getUserId().then((userId) => {
    if (!userId) return;
    supabase.from('bills').upsert({
      id: bill.id,
      user_id: userId,
      card_id: bill.cardId,
      year: bill.year,
      month: bill.month,
      amount: bill.amount,
      is_paid: bill.isPaid,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] bills upsert:', error.message);
    });
  });
}

export function dbDeleteBill(id: string) {
  supabase.from('bills').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('[DB] bills delete:', error.message);
  });
}

// ── Fixed Expenses ──

export function dbSaveFixedExpense(expense: FixedExpense) {
  getUserId().then((userId) => {
    if (!userId) return;
    supabase.from('fixed_expenses').upsert({
      id: expense.id,
      user_id: userId,
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      pay_method: expense.payMethod,
      card_id: expense.cardId || null,
      account_id: expense.accountId || null,
      pay_day: expense.payDay,
      sort_order: expense.sortOrder,
    }, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] fixed_expenses upsert:', error.message);
    });
  });
}

export function dbSaveFixedExpenses(expenses: FixedExpense[]) {
  getUserId().then((userId) => {
    if (!userId) return;
    const rows = expenses.map((f) => ({
      id: f.id,
      user_id: userId,
      name: f.name,
      amount: f.amount,
      category: f.category,
      pay_method: f.payMethod,
      card_id: f.cardId || null,
      account_id: f.accountId || null,
      pay_day: f.payDay,
      sort_order: f.sortOrder,
    }));
    supabase.from('fixed_expenses').upsert(rows, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.error('[DB] fixed_expenses batch upsert:', error.message);
    });
  });
}

export function dbDeleteFixedExpense(id: string) {
  supabase.from('fixed_expenses').delete().eq('id', id).then(({ error }) => {
    if (error) console.error('[DB] fixed_expenses delete:', error.message);
  });
}

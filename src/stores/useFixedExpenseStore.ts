// 고정비 관리 Zustand store
// localStorage에 영속화 + Supabase 실시간 저장
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FixedExpense, FixedExpensePayMethod, FixedExpenseCategory } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';
import { dbSaveFixedExpense, dbSaveFixedExpenses, dbDeleteFixedExpense } from '@/lib/db';

interface FixedExpenseStore {
  expenses: FixedExpense[];
  addExpense: (data: { name: string; amount: number; category: FixedExpenseCategory; payMethod: FixedExpensePayMethod; cardId?: string; accountId?: string; payDay: number }) => void;
  updateExpense: (id: string, data: Partial<Omit<FixedExpense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  reorder: (expenses: FixedExpense[]) => void;
  reset: () => void;
}

export const useFixedExpenseStore = create<FixedExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (data) => {
        const expense: FixedExpense = {
          id: generateId(),
          ...data,
          sortOrder: get().expenses.length,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((state) => ({ expenses: [...state.expenses, expense] }));
        dbSaveFixedExpense(expense);
      },

      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: nowISO() } : e,
          ),
        }));
        const updated = get().expenses.find((e) => e.id === id);
        if (updated) dbSaveFixedExpense(updated);
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
        dbDeleteFixedExpense(id);
      },

      reorder: (expenses) => {
        set({ expenses });
        dbSaveFixedExpenses(expenses);
      },

      reset: () => set({ expenses: [] }),
    }),
    { name: 'cashpilot-fixed-expenses' },
  ),
);

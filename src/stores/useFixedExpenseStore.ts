import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FixedExpense, FixedExpensePayMethod, FixedExpenseCategory } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

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
    (set) => ({
      expenses: [],

      addExpense: (data) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: generateId(),
              ...data,
              sortOrder: state.expenses.length,
              createdAt: nowISO(),
              updatedAt: nowISO(),
            },
          ],
        })),

      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...data, updatedAt: nowISO() } : e,
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      reorder: (expenses) => set({ expenses }),

      reset: () => set({ expenses: [] }),
    }),
    { name: 'cashpilot-fixed-expenses' },
  ),
);

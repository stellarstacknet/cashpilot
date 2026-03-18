// 수입 관리 Zustand store
// 현재 UI에서 직접 사용하지 않으나, 데이터 import/export 호환을 위해 유지
// 향후 수입 관리 기능 추가 시 활용
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Income } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

interface IncomeStore {
  incomes: Income[];
  addIncome: (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIncome: (id: string, data: Partial<Omit<Income, 'id' | 'createdAt'>>) => void;
  deleteIncome: (id: string) => void;
  toggleConfirmed: (id: string) => void;
  toggleActive: (id: string) => void;
  reset: () => void;
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set) => ({
      incomes: [],

      addIncome: (data) =>
        set((state) => ({
          incomes: [
            ...state.incomes,
            {
              ...data,
              id: generateId(),
              createdAt: nowISO(),
              updatedAt: nowISO(),
            },
          ],
        })),

      updateIncome: (id, data) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, ...data, updatedAt: nowISO() } : i,
          ),
        })),

      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      toggleConfirmed: (id) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, isConfirmed: !i.isConfirmed, updatedAt: nowISO() } : i,
          ),
        })),

      toggleActive: (id) =>
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, isActive: !i.isActive, updatedAt: nowISO() } : i,
          ),
        })),

      reset: () => set({ incomes: [] }),
    }),
    { name: 'cashpilot-incomes' },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MonthlyBill } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

interface BillStore {
  bills: MonthlyBill[];
  setBill: (cardId: string, year: number, month: number, amount: number) => void;
  togglePaid: (id: string) => void;
  updateMemo: (id: string, memo: string) => void;
  getBillsForMonth: (year: number, month: number) => MonthlyBill[];
  getBillForCard: (cardId: string, year: number, month: number) => MonthlyBill | undefined;
  reset: () => void;
}

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: [],

      // 청구액 설정 (존재하면 업데이트, 없으면 생성)
      setBill: (cardId, year, month, amount) =>
        set((state) => {
          const existing = state.bills.find(
            (b) => b.cardId === cardId && b.year === year && b.month === month,
          );

          if (existing) {
            return {
              bills: state.bills.map((b) =>
                b.id === existing.id ? { ...b, amount, updatedAt: nowISO() } : b,
              ),
            };
          }

          return {
            bills: [
              ...state.bills,
              {
                id: generateId(),
                cardId,
                year,
                month,
                amount,
                isPaid: false,
                createdAt: nowISO(),
                updatedAt: nowISO(),
              },
            ],
          };
        }),

      togglePaid: (id) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, isPaid: !b.isPaid, updatedAt: nowISO() } : b,
          ),
        })),

      updateMemo: (id, memo) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, memo, updatedAt: nowISO() } : b,
          ),
        })),

      getBillsForMonth: (year, month) =>
        get().bills.filter((b) => b.year === year && b.month === month),

      getBillForCard: (cardId, year, month) =>
        get().bills.find(
          (b) => b.cardId === cardId && b.year === year && b.month === month,
        ),

      reset: () => set({ bills: [] }),
    }),
    { name: 'cashpilot-bills' },
  ),
);

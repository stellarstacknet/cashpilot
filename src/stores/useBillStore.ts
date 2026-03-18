// 월별 청구서 관리 Zustand store
// localStorage에 영속화 + Supabase 실시간 저장
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MonthlyBill } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';
import { dbSaveBill } from '@/lib/db';

interface BillStore {
  bills: MonthlyBill[];
  setBill: (cardId: string, year: number, month: number, amount: number) => void;
  togglePaid: (id: string) => void;
  getBillsForMonth: (year: number, month: number) => MonthlyBill[];
  getBillForCard: (cardId: string, year: number, month: number) => MonthlyBill | undefined;
  reset: () => void;
}

export const useBillStore = create<BillStore>()(
  persist(
    (set, get) => ({
      bills: [],

      setBill: (cardId, year, month, amount) => {
        const existing = get().bills.find(
          (b) => b.cardId === cardId && b.year === year && b.month === month,
        );

        if (existing) {
          const updated = { ...existing, amount, updatedAt: nowISO() };
          set((state) => ({
            bills: state.bills.map((b) => (b.id === existing.id ? updated : b)),
          }));
          dbSaveBill(updated);
        } else {
          const bill: MonthlyBill = {
            id: generateId(),
            cardId,
            year,
            month,
            amount,
            isPaid: false,
            createdAt: nowISO(),
            updatedAt: nowISO(),
          };
          set((state) => ({ bills: [...state.bills, bill] }));
          dbSaveBill(bill);
        }
      },

      togglePaid: (id) => {
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, isPaid: !b.isPaid, updatedAt: nowISO() } : b,
          ),
        }));
        const updated = get().bills.find((b) => b.id === id);
        if (updated) dbSaveBill(updated);
      },

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

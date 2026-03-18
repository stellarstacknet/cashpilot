// 월별 청구서 관리 Zustand store
// localStorage에 영속화, 청구서 생성/업데이트/납부 토글
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MonthlyBill } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

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

      // 청구액 설정 (동일 카드/월 조합이 있으면 업데이트, 없으면 생성)
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

      // 납부 상태 토글
      togglePaid: (id) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, isPaid: !b.isPaid, updatedAt: nowISO() } : b,
          ),
        })),

      // 특정 월의 모든 청구서 조회
      getBillsForMonth: (year, month) =>
        get().bills.filter((b) => b.year === year && b.month === month),

      // 특정 카드의 특정 월 청구서 조회
      getBillForCard: (cardId, year, month) =>
        get().bills.find(
          (b) => b.cardId === cardId && b.year === year && b.month === month,
        ),

      // 전체 초기화
      reset: () => set({ bills: [] }),
    }),
    { name: 'cashpilot-bills' },
  ),
);

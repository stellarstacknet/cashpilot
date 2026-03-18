import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MonthlySnapshot, MonthlyBill } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

interface SnapshotStore {
  snapshots: MonthlySnapshot[];
  saveSnapshot: (data: {
    year: number;
    month: number;
    totalIncome: number;
    totalBills: number;
    totalSavings: number;
    bills: MonthlyBill[];
  }) => void;
  getSnapshot: (year: number, month: number) => MonthlySnapshot | undefined;
  getSnapshotsRange: (months: number) => MonthlySnapshot[];
  reset: () => void;
}

export const useSnapshotStore = create<SnapshotStore>()(
  persist(
    (set, get) => ({
      snapshots: [],

      saveSnapshot: (data) =>
        set((state) => {
          // 같은 월 스냅샷이 이미 있으면 업데이트
          const existing = state.snapshots.find(
            (s) => s.year === data.year && s.month === data.month,
          );

          if (existing) {
            return {
              snapshots: state.snapshots.map((s) =>
                s.id === existing.id ? { ...s, ...data } : s,
              ),
            };
          }

          return {
            snapshots: [
              ...state.snapshots,
              {
                id: generateId(),
                ...data,
                createdAt: nowISO(),
              },
            ],
          };
        }),

      getSnapshot: (year, month) =>
        get().snapshots.find((s) => s.year === year && s.month === month),

      getSnapshotsRange: (months) => {
        const now = new Date();
        const snapshots = get().snapshots.filter((s) => {
          const snapshotDate = new Date(s.year, s.month - 1);
          const diffMonths =
            (now.getFullYear() - snapshotDate.getFullYear()) * 12 +
            (now.getMonth() - snapshotDate.getMonth());
          return diffMonths >= 0 && diffMonths < months;
        });
        return snapshots.sort((a, b) =>
          a.year !== b.year ? a.year - b.year : a.month - b.month,
        );
      },

      reset: () => set({ snapshots: [] }),
    }),
    { name: 'cashpilot-snapshots' },
  ),
);

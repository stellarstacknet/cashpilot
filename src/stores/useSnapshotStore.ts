// 월별 스냅샷 Zustand store
// 현재 UI에서 직접 사용하지 않으나, 데이터 import/export 호환을 위해 유지
// 향후 히스토리/트렌드 분석 기능 추가 시 활용
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

      // 스냅샷 저장 (같은 월이면 업데이트)
      saveSnapshot: (data) =>
        set((state) => {
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

      // 특정 월 스냅샷 조회
      getSnapshot: (year, month) =>
        get().snapshots.find((s) => s.year === year && s.month === month),

      // 최근 N개월 스냅샷 조회 (시간순 정렬)
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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransferStatus } from '@/types';

// 이체 플랜 완료/건너뛰기 상태를 영속화하는 store
// key: `${year}-${month}-${planId}` 형태로 저장
interface TransferStatusStore {
  statuses: Record<string, TransferStatus>;
  setStatus: (year: number, month: number, planId: string, status: TransferStatus) => void;
  getStatus: (year: number, month: number, planId: string) => TransferStatus;
  resetMonth: (year: number, month: number) => void;
  reset: () => void;
}

// 월별 고유 키 생성
function makeKey(year: number, month: number, planId: string): string {
  return `${year}-${month}-${planId}`;
}

export const useTransferStatusStore = create<TransferStatusStore>()(
  persist(
    (set, get) => ({
      statuses: {},

      // 이체 상태 업데이트
      setStatus: (year, month, planId, status) =>
        set((state) => ({
          statuses: {
            ...state.statuses,
            [makeKey(year, month, planId)]: status,
          },
        })),

      // 이체 상태 조회 (기본값: pending)
      getStatus: (year, month, planId) =>
        get().statuses[makeKey(year, month, planId)] || 'pending',

      // 특정 월의 모든 상태 초기화
      resetMonth: (year, month) =>
        set((state) => {
          const prefix = `${year}-${month}-`;
          const newStatuses = { ...state.statuses };
          for (const key of Object.keys(newStatuses)) {
            if (key.startsWith(prefix)) {
              delete newStatuses[key];
            }
          }
          return { statuses: newStatuses };
        }),

      reset: () => set({ statuses: {} }),
    }),
    { name: 'cashpilot-transfer-status' },
  ),
);

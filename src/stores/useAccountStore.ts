// 계좌 관리 Zustand store
// localStorage에 영속화, 계좌 CRUD + 잔액 업데이트 + 정렬 기능
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, AccountPurpose } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

interface AccountStore {
  accounts: Account[];
  addAccount: (data: { bank: string; balance: number; purpose: AccountPurpose }) => void;
  updateAccount: (id: string, data: Partial<Omit<Account, 'id' | 'createdAt'>>) => void;
  deleteAccount: (id: string) => void;
  updateBalance: (id: string, balance: number) => void;
  reorder: (accounts: Account[]) => void;
  reset: () => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      accounts: [],

      // 계좌 추가 (sortOrder는 자동 부여)
      addAccount: (data) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              id: generateId(),
              ...data,
              sortOrder: state.accounts.length,
              createdAt: nowISO(),
              updatedAt: nowISO(),
            },
          ],
        })),

      // 계좌 정보 부분 업데이트
      updateAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: nowISO() } : a,
          ),
        })),

      // 계좌 삭제 (연결 카드 처리는 AccountManager 컴포넌트에서 수행)
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      // 잔액만 빠르게 업데이트
      updateBalance: (id, balance) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, balance, updatedAt: nowISO() } : a,
          ),
        })),

      // 계좌 순서 변경
      reorder: (accounts) => set({ accounts }),

      // 전체 초기화
      reset: () => set({ accounts: [] }),
    }),
    { name: 'cashpilot-accounts' },
  ),
);

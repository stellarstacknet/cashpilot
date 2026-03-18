import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, AccountPurpose } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

interface AccountStore {
  accounts: Account[];
  addAccount: (data: { name: string; bank: string; balance: number; purpose: AccountPurpose }) => void;
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

      updateAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: nowISO() } : a,
          ),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      updateBalance: (id, balance) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, balance, updatedAt: nowISO() } : a,
          ),
        })),

      reorder: (accounts) => set({ accounts }),

      reset: () => set({ accounts: [] }),
    }),
    { name: 'cashpilot-accounts' },
  ),
);

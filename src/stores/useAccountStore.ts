// 계좌 관리 Zustand store
// localStorage에 영속화 + Supabase 실시간 저장
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, AccountPurpose } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';
import { dbSaveAccount, dbSaveAccounts, dbDeleteAccount } from '@/lib/db';

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
    (set, get) => ({
      accounts: [],

      addAccount: (data) => {
        const account: Account = {
          id: generateId(),
          ...data,
          sortOrder: get().accounts.length,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((state) => ({ accounts: [...state.accounts, account] }));
        dbSaveAccount(account);
      },

      updateAccount: (id, data) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: nowISO() } : a,
          ),
        }));
        const updated = get().accounts.find((a) => a.id === id);
        if (updated) dbSaveAccount(updated);
      },

      deleteAccount: (id) => {
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        }));
        dbDeleteAccount(id);
      },

      updateBalance: (id, balance) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, balance, updatedAt: nowISO() } : a,
          ),
        }));
        const updated = get().accounts.find((a) => a.id === id);
        if (updated) dbSaveAccount(updated);
      },

      reorder: (accounts) => {
        set({ accounts });
        dbSaveAccounts(accounts);
      },

      reset: () => set({ accounts: [] }),
    }),
    { name: 'cashpilot-accounts' },
  ),
);

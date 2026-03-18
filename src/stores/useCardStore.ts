// 카드 관리 Zustand store
// localStorage에 영속화 + Supabase 실시간 저장
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';
import { dbSaveCard, dbSaveCards, dbDeleteCard } from '@/lib/db';

interface CardStore {
  cards: Card[];
  addCard: (data: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => void;
  updateCard: (id: string, data: Partial<Omit<Card, 'id' | 'createdAt'>>) => void;
  deleteCard: (id: string) => void;
  toggleActive: (id: string) => void;
  reorder: (cards: Card[]) => void;
  reset: () => void;
}

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],

      addCard: (data) => {
        const card: Card = {
          ...data,
          id: generateId(),
          sortOrder: get().cards.length,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((state) => ({ cards: [...state.cards, card] }));
        dbSaveCard(card);
      },

      updateCard: (id, data) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: nowISO() } : c,
          ),
        }));
        const updated = get().cards.find((c) => c.id === id);
        if (updated) dbSaveCard(updated);
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        }));
        dbDeleteCard(id);
      },

      toggleActive: (id) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive, updatedAt: nowISO() } : c,
          ),
        }));
        const updated = get().cards.find((c) => c.id === id);
        if (updated) dbSaveCard(updated);
      },

      reorder: (cards) => {
        set({ cards });
        dbSaveCards(cards);
      },

      reset: () => set({ cards: [] }),
    }),
    { name: 'cashpilot-cards' },
  ),
);

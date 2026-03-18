import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card } from '@/types';
import { generateId, nowISO } from '@/utils/formatter';

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
    (set) => ({
      cards: [],

      addCard: (data) =>
        set((state) => ({
          cards: [
            ...state.cards,
            {
              ...data,
              id: generateId(),
              sortOrder: state.cards.length,
              createdAt: nowISO(),
              updatedAt: nowISO(),
            },
          ],
        })),

      updateCard: (id, data) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: nowISO() } : c,
          ),
        })),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),

      toggleActive: (id) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive, updatedAt: nowISO() } : c,
          ),
        })),

      reorder: (cards) => set({ cards }),

      reset: () => set({ cards: [] }),
    }),
    { name: 'cashpilot-cards' },
  ),
);

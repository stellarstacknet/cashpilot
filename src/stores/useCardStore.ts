// 카드 관리 Zustand store
// localStorage에 영속화, 카드 CRUD + 활성 토글 + 정렬 기능
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

      // 카드 추가 (sortOrder는 자동 부여)
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

      // 카드 정보 부분 업데이트
      updateCard: (id, data) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: nowISO() } : c,
          ),
        })),

      // 카드 삭제
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),

      // 활성/비활성 토글
      toggleActive: (id) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive, updatedAt: nowISO() } : c,
          ),
        })),

      // 카드 순서 변경
      reorder: (cards) => set({ cards }),

      // 전체 초기화
      reset: () => set({ cards: [] }),
    }),
    { name: 'cashpilot-cards' },
  ),
);

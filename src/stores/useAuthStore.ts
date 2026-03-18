// 인증 관리 Zustand store (Supabase Auth)
// Google OAuth 로그인/로그아웃, 세션 상태 실시간 감지
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,

  // 앱 시작 시 기존 세션 확인 + 실시간 상태 변경 리스너 등록
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
    });
  },

  // Google OAuth 로그인 (리다이렉트 방식)
  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  // 로그아웃
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

'use client';

import { create } from 'zustand';
import type { DataMode } from './useFinanceStore';

export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SessionState {
  user: SessionUser | null;
  mode: DataMode;
  set: (s: { user: SessionUser | null; mode: DataMode }) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  mode: 'demo',
  set: ({ user, mode }) => set({ user, mode }),
}));

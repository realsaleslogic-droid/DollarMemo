'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';

interface UIState {
  // Transaction add/edit modal
  modalOpen: boolean;
  editing: Transaction | null;
  openAdd: () => void;
  openEdit: (t: Transaction) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  modalOpen: false,
  editing: null,
  openAdd: () => set({ modalOpen: true, editing: null }),
  openEdit: (editing) => set({ modalOpen: true, editing }),
  closeModal: () => set({ modalOpen: false, editing: null }),
}));

'use client';

import { create } from 'zustand';
import { setActiveCurrency } from '@/lib/format';
import {
  ACCENT_STORAGE_KEY,
  CURRENCY_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_CURRENCY,
  isAccent,
  isCurrency,
  type AccentId,
} from '@/lib/settings';

interface SettingsState {
  accent: AccentId;
  currency: string;
  hydrated: boolean;
  setAccent: (a: AccentId) => void;
  setCurrency: (c: string) => void;
  /** Load device-local preferences and apply them (accent attr + active currency). */
  hydrateSettings: () => void;
}

function applyAccent(accent: AccentId) {
  if (typeof document !== 'undefined') document.documentElement.dataset.accent = accent;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  accent: DEFAULT_ACCENT,
  currency: DEFAULT_CURRENCY,
  hydrated: false,

  setAccent: (accent) => {
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, accent);
    } catch {
      /* ignore */
    }
    applyAccent(accent);
    set({ accent });
  },

  setCurrency: (currency) => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      /* ignore */
    }
    setActiveCurrency(currency);
    set({ currency });
  },

  hydrateSettings: () => {
    let accent: AccentId = DEFAULT_ACCENT;
    let currency = DEFAULT_CURRENCY;
    try {
      const a = localStorage.getItem(ACCENT_STORAGE_KEY);
      const c = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (isAccent(a)) accent = a;
      if (isCurrency(c)) currency = c;
    } catch {
      /* ignore */
    }
    applyAccent(accent);
    setActiveCurrency(currency);
    set({ accent, currency, hydrated: true });
  },
}));

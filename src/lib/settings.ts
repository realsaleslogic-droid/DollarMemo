// User-configurable appearance + currency options. Accent ids map to CSS
// variable themes defined in globals.css ([data-accent='...']). Only colors
// that read well against the app's light/dark surfaces and don't clash with the
// income-green / expense-coral semantics are offered.

export type AccentId = 'teal' | 'indigo' | 'blue' | 'violet' | 'pink' | 'amber';

export interface Accent {
  id: AccentId;
  label: string;
  swatch: string; // representative color for the picker (the 500 shade)
}

export const ACCENTS: Accent[] = [
  { id: 'teal', label: 'Teal', swatch: '#14a085' },
  { id: 'indigo', label: 'Indigo', swatch: '#6366f1' },
  { id: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { id: 'violet', label: 'Violet', swatch: '#8b5cf6' },
  { id: 'pink', label: 'Pink', swatch: '#ec4899' },
  { id: 'amber', label: 'Amber', swatch: '#f59e0b' },
];

export const DEFAULT_ACCENT: AccentId = 'teal';

export function isAccent(v: unknown): v is AccentId {
  return typeof v === 'string' && ACCENTS.some((a) => a.id === v);
}

export interface Currency {
  code: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'JPY', label: 'Japanese Yen' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'INR', label: 'Indian Rupee' },
];

export const DEFAULT_CURRENCY = 'USD';

export function isCurrency(v: unknown): v is string {
  return typeof v === 'string' && CURRENCIES.some((c) => c.code === v);
}

// localStorage keys (device-local preferences).
export const ACCENT_STORAGE_KEY = 'dm-accent';
export const CURRENCY_STORAGE_KEY = 'dm-currency';

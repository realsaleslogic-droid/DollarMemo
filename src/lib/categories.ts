// Single source of truth for spending categories — used by the UI, charts,
// filters and the seed script. Colors are chosen to read well in both light
// and dark mode and to look good in pie/bar charts.

export type CategoryId =
  | 'Food'
  | 'Shopping'
  | 'Transportation'
  | 'Entertainment'
  | 'Utilities'
  | 'Housing'
  | 'Healthcare'
  | 'Subscriptions'
  | 'Income'
  | 'Other';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string;
  icon: string; // lucide icon name (see components/CategoryIcon)
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'Food', label: 'Food & Dining', color: '#f4715f', icon: 'UtensilsCrossed' },
  { id: 'Shopping', label: 'Shopping', color: '#f59e0b', icon: 'ShoppingBag' },
  { id: 'Transportation', label: 'Transportation', color: '#6366f1', icon: 'Car' },
  { id: 'Entertainment', label: 'Entertainment', color: '#ec4899', icon: 'Clapperboard' },
  { id: 'Utilities', label: 'Utilities', color: '#0ea5e9', icon: 'Lightbulb' },
  { id: 'Housing', label: 'Housing', color: '#8b5cf6', icon: 'Home' },
  { id: 'Healthcare', label: 'Healthcare', color: '#14b8a6', icon: 'HeartPulse' },
  { id: 'Subscriptions', label: 'Subscriptions', color: '#a855f7', icon: 'Repeat' },
  { id: 'Income', label: 'Income', color: '#16b981', icon: 'TrendingUp' },
  { id: 'Other', label: 'Other', color: '#94a3b8', icon: 'Boxes' },
];

export const CATEGORY_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

// Categories that represent spending (everything except Income).
export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'Income');

export function categoryColor(id: string): string {
  return CATEGORY_MAP[id]?.color ?? '#94a3b8';
}

export function categoryLabel(id: string): string {
  return CATEGORY_MAP[id]?.label ?? id;
}

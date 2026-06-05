import type { CategoryId } from '@/lib/categories';

// Map Plaid's Personal Finance Category (primary) to FlowTrack categories.
// Reference: https://plaid.com/docs/api/products/transactions/#categories
// Plaid sends e.g. personal_finance_category.primary = "FOOD_AND_DRINK".
const PFC_PRIMARY_TO_CATEGORY: Record<string, CategoryId> = {
  INCOME: 'Income',
  TRANSFER_IN: 'Income',
  TRANSFER_OUT: 'Other',
  LOAN_PAYMENTS: 'Other',
  BANK_FEES: 'Other',
  ENTERTAINMENT: 'Entertainment',
  FOOD_AND_DRINK: 'Food',
  GENERAL_MERCHANDISE: 'Shopping',
  HOME_IMPROVEMENT: 'Housing',
  MEDICAL: 'Healthcare',
  PERSONAL_CARE: 'Healthcare',
  GENERAL_SERVICES: 'Other',
  GOVERNMENT_AND_NON_PROFIT: 'Other',
  TRANSPORTATION: 'Transportation',
  TRAVEL: 'Transportation',
  RENT_AND_UTILITIES: 'Utilities',
};

/**
 * Resolve a FlowTrack category from a Plaid transaction's PFC primary, falling
 * back through the legacy category array, then to 'Other'.
 */
export function mapPlaidCategory(
  pfcPrimary: string | null | undefined,
  legacyCategory: string[] | null | undefined
): CategoryId {
  if (pfcPrimary && PFC_PRIMARY_TO_CATEGORY[pfcPrimary]) {
    return PFC_PRIMARY_TO_CATEGORY[pfcPrimary];
  }
  // Legacy fallback for the occasional transaction without a PFC.
  const top = legacyCategory?.[0]?.toLowerCase() ?? '';
  if (top.includes('food') || top.includes('restaurant')) return 'Food';
  if (top.includes('travel') || top.includes('transport')) return 'Transportation';
  if (top.includes('shop')) return 'Shopping';
  if (top.includes('recreation') || top.includes('entertain')) return 'Entertainment';
  if (top.includes('health') || top.includes('medical')) return 'Healthcare';
  if (top.includes('rent') || top.includes('utilit')) return 'Utilities';
  if (top.includes('transfer') || top.includes('deposit') || top.includes('payroll')) return 'Income';
  return 'Other';
}

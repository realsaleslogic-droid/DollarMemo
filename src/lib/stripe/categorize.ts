import type { CategoryId } from '@/lib/categories';

// Stripe Financial Connections transactions don't include a category, only a
// free-text description. We infer a DollarMemo category from keywords. Income is
// decided by the amount sign upstream; this maps spending descriptions.

const RULES: { category: CategoryId; keywords: string[] }[] = [
  { category: 'Food', keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'chipotle', 'doordash', 'uber eats', 'grubhub', 'pizza', 'taco', 'burger', 'grocery', 'whole foods', 'trader joe', 'safeway', 'kroger', 'bar & grill', 'deli', 'bakery'] },
  { category: 'Shopping', keywords: ['amazon', 'walmart', 'target', 'costco', 'best buy', 'nike', 'etsy', 'ebay', 'store', 'shop', 'mall', 'ikea', 'home depot', 'lowe'] },
  { category: 'Transportation', keywords: ['uber', 'lyft', 'shell', 'chevron', 'exxon', 'bp ', 'gas', 'fuel', 'parking', 'transit', 'metro', 'toll', 'delta', 'united air', 'american air', 'airlines', 'taxi'] },
  { category: 'Entertainment', keywords: ['netflix', 'spotify', 'hulu', 'disney', 'cinema', 'theatre', 'theater', 'amc', 'steam', 'playstation', 'xbox', 'ticketmaster', 'concert', 'game'] },
  { category: 'Utilities', keywords: ['electric', 'water', 'gas company', 'pg&e', 'comcast', 'xfinity', 'at&t', 'verizon', 't-mobile', 'internet', 'utility', 'sewer', 'wireless', 'phone'] },
  { category: 'Housing', keywords: ['rent', 'mortgage', 'landlord', 'apartment', 'property', 'hoa', 'lease'] },
  { category: 'Healthcare', keywords: ['pharmacy', 'cvs', 'walgreens', 'doctor', 'medical', 'dental', 'clinic', 'hospital', 'health', 'optical', 'vision'] },
  { category: 'Subscriptions', keywords: ['subscription', 'membership', 'prime', 'icloud', 'google one', 'adobe', 'chatgpt', 'openai', 'patreon', 'youtube premium', 'apple.com/bill'] },
];

export function categorizeStripe(description: string): CategoryId {
  const d = (description || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => d.includes(k))) return rule.category;
  }
  return 'Other';
}

/** Tidy a raw bank description into a friendlier merchant label. */
export function cleanMerchant(description: string): string {
  const cleaned = (description || '')
    .replace(/\s+/g, ' ')
    .replace(/\b(pos|purchase|debit|payment|recurring|ach|pmt|id:?\s*\w+|#\d+)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || 'Transaction';
}

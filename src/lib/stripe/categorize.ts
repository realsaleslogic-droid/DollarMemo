import type { CategoryId } from '@/lib/categories';

// Stripe transactions don't include a category, so we infer one. We categorize
// from the CLEANED merchant name (e.g. "Apple", "Transfer from Savings") rather
// than the raw bank descriptor — raw descriptors are full of misleading noise
// (e.g. PayPal's "SHOPPING LOGIC", or "STORE"/"POS") that wrongly forced almost
// everything into Shopping. Rules are checked in order; the first match wins.

const RULES: { category: CategoryId; tokens: string[] }[] = [
  {
    category: 'Subscriptions',
    tokens: [
      'amazon prime', 'prime video', 'icloud', 'google one', 'microsoft 365', 'office 365',
      'adobe', 'chatgpt', 'openai', 'dropbox', 'notion', 'patreon', 'github', 'audible',
      'linkedin premium', 'medium', 'membership', 'subscription',
    ],
  },
  {
    category: 'Food',
    tokens: [
      'starbucks', 'mcdonald', 'chipotle', 'doordash', 'uber eats', 'ubereats', 'grubhub',
      'dunkin', 'taco bell', 'wendy', 'burger king', 'subway', 'panera', "chick-fil", 'popeyes',
      'kfc', 'pizza', 'domino', 'papa john', 'olive garden', 'cheesecake', 'denny', 'ihop',
      'whole foods', 'trader joe', 'safeway', 'kroger', 'publix', 'aldi', 'wegmans', 'sprouts',
      'instacart', 'grocery', 'restaurant', 'cafe', 'coffee', 'diner', 'grill', 'kitchen',
      'eatery', 'bistro', 'bakery', 'deli', 'tavern', 'brewing', 'sushi',
    ],
  },
  {
    category: 'Transportation',
    tokens: [
      'uber', 'lyft', 'shell', 'chevron', 'exxon', 'mobil', 'arco', 'marathon', 'speedway',
      'gas', 'fuel', 'parking', 'metro', 'transit', 'toll', 'amtrak', 'airlines', 'air lines',
      'delta air', 'united air', 'american air', 'southwest', 'jetblue', 'alaska air', 'taxi',
      'autozone', 'car wash', 'jiffy lube',
    ],
  },
  {
    category: 'Entertainment',
    tokens: [
      'netflix', 'spotify', 'hulu', 'disney', 'hbo', 'youtube', 'paramount', 'peacock',
      'apple tv', 'amc', 'cinemark', 'regal', 'fandango', 'ticketmaster', 'stubhub', 'steam',
      'playstation', 'xbox', 'nintendo', 'twitch', 'epic games', 'roblox', 'cinema', 'theatre',
      'theater', 'concert',
    ],
  },
  {
    category: 'Utilities',
    tokens: [
      'comcast', 'xfinity', 'at&t', 'verizon', 't-mobile', 'tmobile', 'spectrum', 'centurylink',
      'pg&e', 'con ed', 'duke energy', 'electric', 'water', 'gas company', 'sewer', 'internet',
      'wireless', 'utility',
    ],
  },
  {
    category: 'Housing',
    tokens: ['rent', 'mortgage', 'apartment', 'landlord', 'property mgmt', 'hoa', 'lease', 'realty', 'leasing'],
  },
  {
    category: 'Healthcare',
    tokens: [
      'cvs', 'walgreens', 'rite aid', 'pharmacy', 'doctor', 'dental', 'dentist', 'clinic',
      'hospital', 'medical', 'health', 'optometry', 'vision center', 'one medical', 'labcorp',
      'quest diag',
    ],
  },
  {
    category: 'Shopping',
    tokens: [
      'amazon', 'amzn', 'walmart', 'target', 'costco', 'best buy', 'bestbuy', 'nike', 'adidas',
      'apple', 'ebay', 'etsy', 'macy', 'nordstrom', 'home depot', 'lowes', 'ikea', 'wayfair',
      'sephora', 'ulta', 'gamestop', 'shein', 'temu', 'old navy', 'lululemon', 'zara', 'h&m',
    ],
  },
];

/** Infer a category from a cleaned merchant name. Unknown -> 'Other'. */
export function categorizeMerchant(merchant: string): CategoryId {
  const m = (merchant || '').toLowerCase();
  if (!m) return 'Other';
  // Transfers between your own accounts aren't spending categories.
  if (m.startsWith('transfer')) return 'Other';
  for (const rule of RULES) {
    if (rule.tokens.some((t) => m.includes(t))) return rule.category;
  }
  return 'Other';
}

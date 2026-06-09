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
      'amazon prime', 'prime video', 'icloud', 'google one', 'google storage', 'microsoft 365',
      'office 365', 'adobe', 'chatgpt', 'openai', 'anthropic', 'claude.ai', 'dropbox', 'notion',
      'patreon', 'github', 'gitlab', 'audible', 'kindle unlimited', 'linkedin premium', 'medium',
      'substack', 'onlyfans', 'canva', 'grammarly', 'lastpass', '1password', 'nordvpn', 'expressvpn',
      'surfshark', 'norton', 'mcafee', 'duolingo', 'masterclass', 'coursera', 'udemy', 'skillshare',
      'nytimes', 'new york times', 'wsj', 'wall street journal', 'the economist', 'washington post',
      'squarespace', 'wix', 'godaddy', 'namecheap', 'mailchimp', 'zoom', 'slack', 'figma',
      'membership', 'subscription',
    ],
  },
  {
    category: 'Food',
    tokens: [
      'starbucks', 'mcdonald', 'chipotle', 'doordash', 'uber eats', 'ubereats', 'grubhub',
      'postmates', 'seamless', 'caviar', 'dunkin', 'taco bell', 'wendy', 'burger king', 'subway',
      'panera', "chick-fil", 'chickfila', 'popeyes', 'kfc', 'pizza', 'domino', 'papa john',
      'little caesar', 'pizza hut', 'olive garden', 'cheesecake', 'denny', 'ihop', 'applebee',
      'chili', "arby", 'sonic drive', 'jack in the box', 'in-n-out', 'in n out', 'five guys',
      'shake shack', 'whataburger', 'raising cane', 'jersey mike', 'jimmy john', 'panda express',
      'noodles', 'qdoba', "moe's", 'wingstop', 'buffalo wild', 'red lobster', 'outback', 'texas roadhouse',
      'cracker barrel', 'waffle house', 'baskin', 'dairy queen', 'cold stone', 'krispy kreme',
      'tim hortons', 'peet', 'caribou coffee', 'whole foods', 'trader joe', 'safeway', 'kroger',
      'publix', 'aldi', 'wegmans', 'sprouts', 'food lion', 'giant eagle', 'h-e-b', 'heb ',
      'stop & shop', 'harris teeter', 'meijer', 'winco', 'vons', 'ralphs', 'albertsons',
      'fresh market', 'instacart', 'grocery', 'supermarket', 'restaurant', 'cafe', 'coffee',
      'diner', 'grill', 'kitchen', 'eatery', 'bistro', 'bakery', 'deli', 'tavern', 'brewing',
      'sushi', 'taqueria', 'cantina', 'steakhouse', 'noodle', 'ramen', 'bbq', 'barbecue',
    ],
  },
  {
    category: 'Transportation',
    tokens: [
      'uber', 'lyft', 'shell', 'chevron', 'exxon', 'mobil', 'arco', 'marathon', 'speedway',
      'bp ', 'citgo', 'valero', 'phillips 66', 'conoco', 'sunoco', 'sinclair', '76 ', 'wawa',
      'quiktrip', 'racetrac', 'circle k', 'gas station', 'fuel', 'parking', 'parkmobile', 'spothero',
      'mta', 'bart', 'transit', 'toll', 'ezpass', 'e-zpass', 'fastrak', 'amtrak',
      'greyhound', 'airlines', 'air lines', 'delta air', 'united air', 'american air', 'southwest air',
      'jetblue', 'alaska air', 'spirit air', 'taxi', 'autozone', "o'reilly auto",
      'advance auto', 'napa auto', 'pep boys', 'car wash', 'jiffy lube', 'valvoline', 'midas',
      'firestone', 'goodyear', 'discount tire', 'enterprise rent', 'hertz', 'avis', 'budget rent',
      'turo', 'zipcar',
    ],
  },
  {
    category: 'Entertainment',
    tokens: [
      'netflix', 'spotify', 'hulu', 'disney', 'hbo', 'hbo max', 'youtube', 'paramount', 'peacock',
      'apple tv', 'apple music', 'pandora', 'tidal', 'siriusxm', 'crunchyroll', 'amc', 'cinemark',
      'regal', 'fandango', 'ticketmaster', 'stubhub', 'seatgeek', 'axs ', 'live nation', 'steam',
      'playstation', 'xbox', 'nintendo', 'twitch', 'epic games', 'riot games', 'blizzard',
      'roblox', 'discord', 'humble bundle', 'cinema', 'theatre', 'theater', 'concert', 'museum',
      'arcade', 'bowling', 'golf', 'casino', 'dave & buster', 'topgolf', 'six flags', 'cedar point',
      'universal studio', 'sea world',
    ],
  },
  {
    category: 'Utilities',
    tokens: [
      'comcast', 'xfinity', 'at&t', 'verizon', 't-mobile', 'tmobile', 'spectrum',
      'centurylink', 'cox communic', 'frontier comm', 'optimum', 'mint mobile', 'cricket wireless',
      'boost mobile', 'metro pcs', 'metropcs', 'google fi', 'pg&e', 'con ed', 'coned', 'duke energy',
      'dominion energy', 'national grid', 'socal edison', 'so cal gas', 'georgia power', 'fpl ',
      'florida power', 'xcel energy', 'pse&g', 'electric', 'water', 'gas company', 'sewer', 'sanitation',
      'waste management', 'republic services', 'trash', 'internet', 'broadband', 'wireless', 'utility',
    ],
  },
  {
    category: 'Housing',
    tokens: [
      'rent', 'mortgage', 'apartment', 'landlord', 'property mgmt', 'property management', 'hoa',
      'lease', 'realty', 'leasing', 'greystar', 'avalon', 'equity residential', 'airbnb', 'vrbo',
      'storage', 'public storage', 'extra space', 'home insurance', 'renters insurance',
    ],
  },
  {
    category: 'Healthcare',
    tokens: [
      'cvs', 'walgreens', 'rite aid', 'pharmacy', 'doctor', 'dental', 'dentist', 'orthodont',
      'clinic', 'hospital', 'medical', 'health', 'urgent care', 'optometry', 'vision center',
      'lenscrafters', 'warby parker', 'one medical', 'labcorp', 'quest diag', 'kaiser', 'walgreen',
      'goodrx', 'physician', 'therapy', 'chiropractic', 'dermatology', 'pediatric', 'veterinary',
      'vet ', 'animal hospital', 'chewy',
    ],
  },
  {
    category: 'Shopping',
    tokens: [
      'amazon', 'amzn', 'walmart', 'target', 'costco', "sam's club", 'sams club', "bj's wholesale",
      'best buy', 'bestbuy', 'nike', 'adidas', 'under armour', 'apple', 'microsoft store', 'ebay',
      'etsy', 'aliexpress', 'macy', 'nordstrom', 'kohl', 'jcpenney', 'dillard', 'tj maxx', 'tjmaxx',
      'marshalls', 'ross stores', 'ross dress', 'burlington', 'nordstrom rack', 'home depot', 'lowes',
      "lowe's", 'menards', 'ace hardware', 'harbor freight', 'ikea', 'wayfair', 'crate & barrel',
      'pottery barn', 'west elm', 'williams-sonoma', 'bed bath', 'container store', 'homegoods',
      'sephora', 'ulta', 'bath & body', 'gamestop', 'shein', 'temu', 'old navy', 'gap ', 'banana republic',
      'lululemon', 'zara', 'h&m', 'uniqlo', 'urban outfitters', 'anthropologie', 'forever 21',
      'american eagle', 'abercrombie', 'victoria', 'nordstrom', 'dick', "kohl's", 'rei ', 'petco',
      'petsmart', 'michaels', 'hobby lobby', 'joann', 'staples', 'office depot', 'office max',
      'dollar general', 'dollar tree', 'family dollar', 'five below', 'wish ',
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

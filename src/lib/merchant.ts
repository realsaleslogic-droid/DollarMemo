// Turn a raw bank/card statement descriptor into a clean, human-readable name.
// Examples:
//   "PAYPAL 260427 APPLE.COM BILL SHOPPING LOGIC"  -> "Apple (via PayPal)"
//   "SQ *BLUE BOTTLE COFFEE"                        -> "Blue Bottle Coffee (via Square)"
//   "POS DEBIT WALMART #1842 SEATTLE WA"            -> "Walmart"
//   "NETFLIX.COM"                                   -> "Netflix"

// Payment processors that prefix the real merchant. Detected on the raw string;
// the matched word is removed so it isn't repeated in the name.
const PROCESSORS: { re: RegExp; name: string }[] = [
  { re: /\bpaypal\b|\bpp\*/i, name: 'PayPal' },
  { re: /\bvenmo\b/i, name: 'Venmo' },
  { re: /\bcash\s?app\b/i, name: 'Cash App' },
  { re: /\bsq\b|\bsquare\b/i, name: 'Square' },
  { re: /\btst\b|\btoast\b/i, name: 'Toast' },
  { re: /\bzelle\b/i, name: 'Zelle' },
  { re: /\bgoogle\s?pay\b|\bgpay\b/i, name: 'Google Pay' },
];

// Known merchants -> clean display name (matched as a substring of the cleaned,
// lowercased descriptor; longer/more specific tokens first).
const BRAND_DISPLAY: { tokens: string[]; name: string }[] = [
  { tokens: ['amazon prime', 'amzn prime', 'amazonprime'], name: 'Amazon Prime' },
  { tokens: ['amazon', 'amzn'], name: 'Amazon' },
  { tokens: ['apple'], name: 'Apple' },
  { tokens: ['netflix'], name: 'Netflix' },
  { tokens: ['spotify'], name: 'Spotify' },
  { tokens: ['youtube'], name: 'YouTube' },
  { tokens: ['hulu'], name: 'Hulu' },
  { tokens: ['disney'], name: 'Disney+' },
  { tokens: ['uber eats', 'ubereats'], name: 'Uber Eats' },
  { tokens: ['uber'], name: 'Uber' },
  { tokens: ['lyft'], name: 'Lyft' },
  { tokens: ['doordash'], name: 'DoorDash' },
  { tokens: ['grubhub'], name: 'Grubhub' },
  { tokens: ['starbucks'], name: 'Starbucks' },
  { tokens: ['mcdonald'], name: "McDonald's" },
  { tokens: ['chipotle'], name: 'Chipotle' },
  { tokens: ['whole foods', 'wholefds', 'wholefoods'], name: 'Whole Foods' },
  { tokens: ['trader joe'], name: "Trader Joe's" },
  { tokens: ['walmart'], name: 'Walmart' },
  { tokens: ['target'], name: 'Target' },
  { tokens: ['costco'], name: 'Costco' },
  { tokens: ['best buy', 'bestbuy'], name: 'Best Buy' },
  { tokens: ['nike'], name: 'Nike' },
  { tokens: ['cvs'], name: 'CVS Pharmacy' },
  { tokens: ['walgreens'], name: 'Walgreens' },
  { tokens: ['shell'], name: 'Shell' },
  { tokens: ['chevron'], name: 'Chevron' },
  { tokens: ['exxon'], name: 'Exxon' },
  { tokens: ['adobe'], name: 'Adobe' },
  { tokens: ['microsoft', 'msft'], name: 'Microsoft' },
  { tokens: ['google'], name: 'Google' },
  { tokens: ['openai', 'chatgpt'], name: 'OpenAI' },
  { tokens: ['comcast', 'xfinity'], name: 'Xfinity' },
  { tokens: ['verizon'], name: 'Verizon' },
  { tokens: ['t-mobile', 'tmobile'], name: 'T-Mobile' },
];

// Filler tokens that add no meaning in a statement descriptor.
const NOISE = /\b(pos|purchase|payment|pmt|debit|credit|ach|recurring|autopay|web|online|bill|billpay|transaction|trans|ref|invoice|inv|auth|des|tot|intl|transfer)\b/gi;

function stripNoise(s: string): string {
  return s
    .replace(/\*/g, ' ')
    .replace(/[#_|]+/g, ' ')
    .replace(/\.(com|net|org|io|co|app|gov)\b/gi, ' ') // strip TLDs
    .replace(/\b\d[\d-]{3,}\b/g, ' ') // long reference numbers / dates
    .replace(NOISE, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Acronyms to keep uppercase when title-casing an unknown merchant.
const ACRONYMS = new Set(['CVS', 'AMC', 'BP', 'ATM', 'USA', 'HBO', 'KFC', 'TV', 'NYC', 'DMV', 'IRS', 'USPS']);

const US_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
]);

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) =>
      ACRONYMS.has(w.toUpperCase())
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(' ');
}

// Remove a trailing US state abbreviation (often a location suffix).
function stripTrailingState(s: string): string {
  const parts = s.split(/\s+/);
  if (parts.length > 1 && US_STATES.has(parts[parts.length - 1].toUpperCase())) {
    parts.pop();
  }
  return parts.join(' ');
}

function brandFromString(s: string): string | null {
  const low = s.toLowerCase();
  for (const b of BRAND_DISPLAY) {
    if (b.tokens.some((t) => low.includes(t))) return b.name;
  }
  return null;
}

export function prettyMerchant(raw: string): string {
  if (!raw || !raw.trim()) return 'Transaction';

  // Which payment processor (if any) is fronting the charge?
  const proc = PROCESSORS.find((p) => p.re.test(raw)) ?? null;

  const cleaned = stripNoise(raw);

  // Strip the processor word(s) so the real merchant is left.
  let core = cleaned;
  for (const p of PROCESSORS) core = core.replace(p.re, ' ');
  core = stripTrailingState(core.replace(/\s{2,}/g, ' ').trim());

  let name = brandFromString(core) ?? titleCase(core);

  // Nothing meaningful besides the processor -> it's a direct transfer.
  if (!name && proc) return proc.name;
  if (!name) name = 'Transaction';

  if (proc && name.toLowerCase() !== proc.name.toLowerCase()) {
    return `${name} (via ${proc.name})`;
  }
  return name;
}

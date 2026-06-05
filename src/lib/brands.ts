// Maps recognizable merchants to a brand logo (looked up by domain) and an
// optional brand color used as a subtle avatar background tint. Logos are
// fetched client-side from logo CDNs; any merchant not matched here falls back
// to the generic category icon (see components/MerchantAvatar).

export interface Brand {
  domain: string;
  color?: string; // brand color, used for the avatar background tint
}

// Keyed by a canonical, normalized token. A merchant matches a key when its
// normalized name equals, starts with, or contains the key (see `brandFor`),
// so "Amazon Prime" and "Etsy Shop" still resolve to amazon / etsy.
const BRANDS: Record<string, Brand> = {
  // Food & dining
  starbucks: { domain: 'starbucks.com', color: '#00704A' },
  wholefoods: { domain: 'wholefoodsmarket.com', color: '#00674B' },
  chipotle: { domain: 'chipotle.com', color: '#A81612' },
  mcdonalds: { domain: 'mcdonalds.com', color: '#DA291C' },
  doordash: { domain: 'doordash.com', color: '#FF3008' },
  traderjoes: { domain: 'traderjoes.com', color: '#C8102E' },
  olivegarden: { domain: 'olivegarden.com', color: '#5A7302' },
  // Shopping
  amazon: { domain: 'amazon.com', color: '#FF9900' },
  target: { domain: 'target.com', color: '#CC0000' },
  walmart: { domain: 'walmart.com', color: '#0071CE' },
  costco: { domain: 'costco.com', color: '#005DAA' },
  bestbuy: { domain: 'bestbuy.com', color: '#0046BE' },
  nike: { domain: 'nike.com', color: '#111111' },
  // Transportation
  uber: { domain: 'uber.com', color: '#000000' },
  lyft: { domain: 'lyft.com', color: '#FF00BF' },
  shell: { domain: 'shell.com', color: '#ED1C24' },
  chevron: { domain: 'chevron.com', color: '#0054A4' },
  // Entertainment
  amctheatres: { domain: 'amctheatres.com', color: '#E03A3E' },
  steam: { domain: 'steampowered.com', color: '#1B2838' },
  ticketmaster: { domain: 'ticketmaster.com', color: '#026CDF' },
  davebusters: { domain: 'daveandbusters.com', color: '#1D1D1B' },
  // Healthcare
  cvs: { domain: 'cvs.com', color: '#CC0000' },
  walgreens: { domain: 'walgreens.com', color: '#E31837' },
  onemedical: { domain: 'onemedical.com', color: '#22305A' },
  // Subscriptions
  netflix: { domain: 'netflix.com', color: '#E50914' },
  spotify: { domain: 'spotify.com', color: '#1DB954' },
  chatgpt: { domain: 'openai.com', color: '#000000' },
  apple: { domain: 'apple.com', color: '#555555' },
  youtube: { domain: 'youtube.com', color: '#FF0000' },
  icloud: { domain: 'icloud.com', color: '#3693F3' },
  adobe: { domain: 'adobe.com', color: '#FA0F00' },
  // Utilities
  pge: { domain: 'pge.com', color: '#0033A0' },
  comcast: { domain: 'xfinity.com', color: '#000000' },
  att: { domain: 'att.com', color: '#00A8E0' },
  // Other / income sources
  usps: { domain: 'usps.com', color: '#333366' },
  etsy: { domain: 'etsy.com', color: '#F45800' },
  paypal: { domain: 'paypal.com', color: '#003087' },
  upwork: { domain: 'upwork.com', color: '#14A800' },
  fiverr: { domain: 'fiverr.com', color: '#1DBF73' },
  stripe: { domain: 'stripe.com', color: '#635BFF' },
};

// Longest keys first so e.g. a more specific token wins over a shorter one.
const KEYS = Object.keys(BRANDS).sort((a, b) => b.length - a.length);

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Resolve a merchant name to a known brand, or null if it isn't recognizable. */
export function brandFor(merchant: string): Brand | null {
  const m = normalize(merchant);
  if (!m) return null;
  for (const key of KEYS) {
    if (m === key) return BRANDS[key];
    // Require a reasonably specific match: long keys can appear anywhere in the
    // name; short keys (e.g. "att", "pge", "cvs") must anchor the start to avoid
    // accidental hits inside unrelated words.
    if (m.includes(key) && (key.length >= 4 || m.startsWith(key))) return BRANDS[key];
  }
  return null;
}

/** Primary logo source (full-color brand logo). */
export function brandLogoUrl(domain: string, size = 128): string {
  return `https://logo.clearbit.com/${domain}?size=${size}`;
}

/** Fallback logo source (favicon) if the primary logo is unavailable. */
export function faviconUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

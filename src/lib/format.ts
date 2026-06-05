// Formatting helpers shared across the app.
//
// Currency is configurable at runtime (Settings → Currency). The active code is
// held in a module-level variable that `setActiveCurrency` updates; formatters
// are cached per currency. Components re-render on navigation/state changes, so
// they pick up the new currency the next time they format.

let activeCurrency = 'USD';

interface Formatters {
  full: Intl.NumberFormat;
  compact: Intl.NumberFormat;
}

const cache = new Map<string, Formatters>();

function formatters(code: string): Formatters {
  let f = cache.get(code);
  if (!f) {
    try {
      f = {
        full: new Intl.NumberFormat('en-US', { style: 'currency', currency: code }),
        compact: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          notation: 'compact',
          maximumFractionDigits: 1,
        }),
      };
    } catch {
      // Unknown code — fall back to USD so the app never throws while formatting.
      return formatters('USD');
    }
    cache.set(code, f);
  }
  return f;
}

export function setActiveCurrency(code: string): void {
  activeCurrency = code || 'USD';
}

export function getActiveCurrency(): string {
  return activeCurrency;
}

/** The currency's symbol for the active (or given) code, e.g. "$", "€", "¥". */
export function currencySymbol(code: string = activeCurrency): string {
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? '$';
  } catch {
    return '$';
  }
}

/** $1,234.56 — sign is taken from the number itself. */
export function formatMoney(n: number): string {
  return formatters(activeCurrency).full.format(n);
}

/** Absolute money value (no sign), e.g. for expense rows shown as -$85.00. */
export function formatAbs(n: number): string {
  return formatters(activeCurrency).full.format(Math.abs(n));
}

/** $1.2K / $3.4M for tight chart axes and big stat cards. */
export function formatCompact(n: number): string {
  return formatters(activeCurrency).compact.format(n);
}

export function formatPercent(n: number, digits = 0): string {
  return `${n >= 0 ? '' : ''}${n.toFixed(digits)}%`;
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

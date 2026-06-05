// Formatting helpers shared across the app.

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_COMPACT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** $1,234.56 — sign is taken from the number itself. */
export function formatMoney(n: number): string {
  return USD.format(n);
}

/** Absolute money value (no sign), e.g. for expense rows shown as -$85.00. */
export function formatAbs(n: number): string {
  return USD.format(Math.abs(n));
}

/** $1.2K / $3.4M for tight chart axes and big stat cards. */
export function formatCompact(n: number): string {
  return USD_COMPACT.format(n);
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

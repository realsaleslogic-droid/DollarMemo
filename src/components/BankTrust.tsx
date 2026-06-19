import { ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Small one-line reassurance for directly under a "Connect bank" button.
 */
export function BankTrustLine({ className }: { className?: string }) {
  return (
    <p className={cn('inline-flex items-center gap-1.5 text-xs text-ink-soft', className)}>
      <Lock size={12} className="shrink-0 text-brand-600 dark:text-brand-300" />
      Secured by Stripe — your bank login is never seen or stored.
    </p>
  );
}

/**
 * Prominent, premium-looking trust badge for the onboarding page and the
 * Accounts page, with an icon, a clear explanation, and reassurance chips.
 */
export function BankTrustBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3.5 rounded-2xl border border-line bg-surface/70 p-4 backdrop-blur',
        className
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/12 text-brand-600 dark:text-brand-300">
        <ShieldCheck size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">Bank-level security</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
          Connections are powered by <span className="font-semibold text-ink">Stripe</span> — trusted
          by millions of businesses. Your login is entered with Stripe and{' '}
          <span className="font-semibold text-ink">never seen or stored</span> by DollarMemo.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {['256-bit encryption', 'Powered by Stripe', 'Read-only access'].map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700 dark:text-brand-300"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

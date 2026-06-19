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
 * Compact one-line trust badge for the onboarding page and the Accounts page.
 * Uses the active accent color, so it matches whatever theme the user picks.
 */
export function BankTrustBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3.5 py-1.5 text-xs font-medium text-brand-700 dark:text-brand-300',
        className
      )}
    >
      <ShieldCheck size={14} className="shrink-0 text-brand-600 dark:text-brand-300" />
      <span>
        Securely <span className="font-bold">handled by Stripe</span>
      </span>
    </div>
  );
}

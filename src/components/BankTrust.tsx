import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tiny shield + "Secured by Stripe" for directly under a "Connect bank" button.
 * Uses the active accent color so it matches the selected theme.
 */
export function BankTrustLine({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold leading-none text-brand-700 dark:text-brand-300',
        className
      )}
    >
      <ShieldCheck size={11} className="shrink-0" />
      Secured by Stripe
    </p>
  );
}

/**
 * Compact one-line "Bank-level secure" pill for the Accounts page. Uses the
 * active accent color, so it matches whatever theme the user picks.
 */
export function BankTrustBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3.5 py-1.5 text-xs font-bold text-brand-700 dark:text-brand-300',
        className
      )}
    >
      <ShieldCheck size={14} className="shrink-0 text-brand-600 dark:text-brand-300" />
      <span>Secured by Stripe</span>
    </div>
  );
}

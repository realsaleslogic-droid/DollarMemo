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
 * Compact one-line gold "trust seal" badge for the onboarding page and the
 * Accounts page — premium and reassuring without taking much space.
 */
export function BankTrustBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium',
        'border-amber-300/80 bg-amber-50 text-amber-900',
        'dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200',
        className
      )}
    >
      <ShieldCheck size={14} className="shrink-0 text-amber-500 dark:text-amber-300" />
      <span>
        <span className="font-bold">Bank-level secure</span> — powered by Stripe, login never stored
      </span>
    </div>
  );
}

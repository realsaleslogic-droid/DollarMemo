'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, HelpCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { NAV_ITEMS } from './nav';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/store/useSessionStore';

export default function Sidebar() {
  const pathname = usePathname();
  const mode = useSessionStore((s) => s.mode);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface/80 px-4 py-6 backdrop-blur-xl lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
        <BrandLogo className="h-10 w-10" />
        <div>
          <p className="text-lg font-extrabold leading-none tracking-tight">DollarMemo</p>
          <p className="text-[11px] font-medium text-ink-soft">Personal Finance</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition',
                active
                  ? 'bg-brand-gradient text-white shadow-glow'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
              )}
            >
              <Icon size={19} strokeWidth={2.2} />
              {item.label}
            </Link>
          );
        })}

        {(() => {
          const active = pathname === '/help' || pathname.startsWith('/help/');
          return (
            <Link
              href="/help"
              className={cn(
                'mt-1 flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                active ? 'text-brand-600 dark:text-brand-300' : 'text-ink-soft hover:bg-surface-2 hover:text-ink'
              )}
            >
              <HelpCircle size={15} strokeWidth={2.2} />
              Help &amp; FAQ
            </Link>
          );
        })()}
      </nav>

      {mode === 'demo' ? (
        <Link href="/signup" className="mt-4 block rounded-2xl bg-brand-radial p-4 text-white shadow-glow transition hover:brightness-110">
          <Sparkles size={18} className="mb-2 opacity-90" />
          <p className="text-sm font-bold leading-tight">You&apos;re in demo mode</p>
          <p className="mt-1 text-xs text-white/80">
            Changes save only in this browser. Create a free account to keep your data →
          </p>
        </Link>
      ) : (
        <div className="mt-4 rounded-2xl bg-brand-radial p-4 text-white shadow-glow">
          <Sparkles size={18} className="mb-2 opacity-90" />
          <p className="text-sm font-bold leading-tight">Spend smarter, save more</p>
          <p className="mt-1 text-xs text-white/80">Your data is saved to your account.</p>
        </div>
      )}
    </aside>
  );
}

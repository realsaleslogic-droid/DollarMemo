'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, LogOut, ChevronDown, Sparkles, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import BrandLogo from './BrandLogo';
import { useUIStore } from '@/store/useUIStore';
import { useSessionStore } from '@/store/useSessionStore';
import { logout } from '@/app/auth-actions';

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || '?').trim();
  const parts = base.split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || base[0].toUpperCase();
}

function AccountMenu() {
  const user = useSessionStore((s) => s.user);
  const [open, setOpen] = useState(false);
  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-2 rounded-xl border border-line bg-surface px-2 py-1.5 text-sm font-semibold transition hover:bg-surface-2"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-xs text-white">
          {initials(user.name, user.email)}
        </span>
        <span className="hidden max-w-[120px] truncate sm:inline">{user.name || user.email}</span>
        <ChevronDown size={15} className="text-ink-soft" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface shadow-card-lg">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-semibold">{user.name || 'Account'}</p>
            <p className="truncate text-xs text-ink-soft">{user.email}</p>
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-b border-line px-4 py-3 text-sm font-medium text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            <Settings size={16} /> Settings
          </Link>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-ink-soft transition hover:bg-surface-2 hover:text-expense">
              <LogOut size={16} /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const openAdd = useUIStore((s) => s.openAdd);
  const mode = useSessionStore((s) => s.mode);

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-2 flex items-center justify-between gap-3 border-b border-line bg-page/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:bg-transparent lg:backdrop-blur-none">
      <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
        <BrandLogo className="h-9 w-9" />
      </Link>

      <div className="hidden flex-col lg:flex">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {mode === 'demo' && (
          <Link
            href="/signup"
            className="hidden items-center gap-1.5 rounded-full border border-brand-400/40 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-500/20 dark:text-brand-300 sm:inline-flex"
          >
            <Sparkles size={13} /> Demo · Sign up to save
          </Link>
        )}
        <ThemeToggle />
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
        {mode === 'db' ? (
          <AccountMenu />
        ) : (
          <>
            <Link
              href="/settings"
              aria-label="Settings"
              className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition hover:bg-surface-2 hover:text-ink"
            >
              <Settings size={18} />
            </Link>
            <Link href="/signup" className="btn-ghost sm:hidden">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}

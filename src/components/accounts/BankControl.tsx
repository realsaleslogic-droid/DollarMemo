'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Landmark, Loader2, ChevronDown, Plus, Settings } from 'lucide-react';
import { listConnections, type Connection } from '@/app/stripe-actions';
import { bankBrandFor, brandLogoUrl } from '@/lib/brands';
import ConnectBankButton from './ConnectBankButton';
import { useConnectBank } from './useConnectBank';
import { cn } from '@/lib/utils';

function BankLogo({ name }: { name: string | null }) {
  const brand = name ? bankBrandFor(name) : null;
  const [failed, setFailed] = useState(false);
  if (!brand || failed) return <Landmark size={16} className="text-brand-600 dark:text-brand-300" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandLogoUrl(brand.domain, 64)}
      alt=""
      className="h-[18px] w-[18px] shrink-0 rounded object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function label(c: Connection): string {
  const name = c.institutionName ?? 'Bank';
  return c.last4 ? `${name} ···· ${c.last4}` : name;
}

/**
 * Dashboard bank control:
 *  - no accounts  -> "Connect bank" button
 *  - one account  -> bank pill ("Wells Fargo ···· 7605")
 *  - many accounts-> dropdown listing each, plus connect another / manage.
 */
export default function BankControl() {
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [open, setOpen] = useState(false);

  async function refetch() {
    try {
      setConnections(await listConnections());
    } catch {
      setConnections([]);
    }
  }
  useEffect(() => {
    refetch();
  }, []);

  const { connect, busy } = useConnectBank(refetch);

  if (connections === null) return <div className="skeleton h-9 w-36 rounded-xl" />;

  if (connections.length === 0) {
    return <ConnectBankButton onLinked={refetch} />;
  }

  if (connections.length === 1) {
    const c = connections[0];
    return (
      <Link
        href="/accounts"
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold transition hover:bg-surface-2"
      >
        <BankLogo name={c.institutionName} />
        <span className="max-w-[170px] truncate">{label(c)}</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold transition hover:bg-surface-2"
      >
        <Landmark size={16} className="text-brand-600 dark:text-brand-300" />
        <span>{connections.length} banks</span>
        <ChevronDown size={14} className={cn('text-ink-soft transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-1 w-64 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
          {connections.map((c) => (
            <Link
              key={c.id}
              href="/accounts"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-surface-2"
            >
              <BankLogo name={c.institutionName} />
              <span className="truncate">{label(c)}</span>
            </Link>
          ))}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setOpen(false);
              connect();
            }}
            disabled={busy}
            className="flex w-full items-center gap-2.5 border-t border-line px-3 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-surface-2 disabled:opacity-60 dark:text-brand-300"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Connect another bank
          </button>
          <Link
            href="/accounts"
            className="flex items-center gap-2.5 border-t border-line px-3 py-2.5 text-sm text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            <Settings size={15} /> Manage accounts
          </Link>
        </div>
      )}
    </div>
  );
}

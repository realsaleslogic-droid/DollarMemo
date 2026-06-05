'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaidLink, type PlaidLinkOnSuccess } from 'react-plaid-link';
import { Landmark, Loader2 } from 'lucide-react';
import { createLinkToken, exchangePublicToken } from '@/app/plaid-actions';
import { cn } from '@/lib/utils';

/**
 * Opens Plaid Link to connect a bank/card. On success it exchanges the public
 * token (server-side), runs the first sync, and refreshes the route so the new
 * transactions appear everywhere.
 */
export default function ConnectBankButton({
  className,
  onLinked,
}: {
  className?: string;
  onLinked?: () => void;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // fetching token or exchanging
  const [pendingOpen, setPendingOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      setBusy(true);
      setError(null);
      try {
        await exchangePublicToken(publicToken, {
          id: metadata.institution?.institution_id,
          name: metadata.institution?.name,
        });
        setToken(null); // force a fresh link token next time
        onLinked?.();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to link account');
      } finally {
        setBusy(false);
      }
    },
    [onLinked, router]
  );

  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
    onExit: () => setPendingOpen(false),
  });

  // Once we have a token and Plaid Link is ready, open it (if the user asked).
  useEffect(() => {
    if (pendingOpen && ready && token) {
      setPendingOpen(false);
      open();
    }
  }, [pendingOpen, ready, token, open]);

  const handleClick = async () => {
    setError(null);
    if (token && ready) {
      open();
      return;
    }
    setBusy(true);
    setPendingOpen(true);
    try {
      const t = await createLinkToken();
      setToken(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start bank connection');
      setPendingOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={busy}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:opacity-60',
          className
        )}
      >
        {busy ? <Loader2 size={17} className="animate-spin" /> : <Landmark size={17} />}
        {busy ? 'Connecting…' : 'Connect a bank or card'}
      </button>
      {error && <p className="max-w-xs text-xs text-expense">{error}</p>}
    </div>
  );
}

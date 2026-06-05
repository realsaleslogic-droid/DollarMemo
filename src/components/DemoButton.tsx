'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enters the no-login demo: sets the `ft_demo` cookie (so middleware lets the
 * app routes through) and navigates in. Demo data lives in the browser only.
 */
export default function DemoButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const enterDemo = () => {
    setLoading(true);
    // 7-day demo cookie.
    document.cookie = `ft_demo=1; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    router.push('/dashboard');
  };

  return (
    <button onClick={enterDemo} className={className} disabled={loading}>
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

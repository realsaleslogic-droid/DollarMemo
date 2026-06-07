import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { rowToTransaction, type Row } from '@/lib/transactionRow';
import type { Transaction } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import AppBootstrap from '@/components/AppBootstrap';
import TransactionModal from '@/components/TransactionModal';
import type { SessionUser } from '@/store/useSessionStore';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isDemo = cookies().get('ft_demo')?.value === '1';

  if (!user && !isDemo) redirect('/login');

  const mode = user ? 'db' : 'demo';

  let transactions: Transaction[] = [];
  if (user) {
    // Bound the read: select only the columns we use and cap how many rows a
    // single user can load, so no account (however large) can balloon the
    // payload, DB egress, or client-side analytics work. The (user_id, date)
    // index keeps this fast at scale.
    const { data } = await supabase
      .from('transactions')
      .select('id,date,merchant,category,amount,type,description,is_recurring,recurring_id,frequency')
      .order('date', { ascending: false })
      .limit(5000);
    transactions = ((data ?? []) as Row[]).map(rowToTransaction);
  }

  const sessionUser: SessionUser | null = user
    ? {
        name: (user.user_metadata?.name as string | undefined) ?? null,
        email: user.email ?? null,
        image: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }
    : null;

  return (
    <div className="app-bg flex min-h-screen">
      <AppBootstrap mode={mode} user={sessionUser} transactions={transactions} />
      <Sidebar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-3 sm:px-6 lg:pb-10">
        {children}
      </main>
      <BottomNav />
      <TransactionModal />
    </div>
  );
}

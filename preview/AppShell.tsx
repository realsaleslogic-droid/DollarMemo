import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import TransactionModal from '@/components/TransactionModal';

// Mirrors src/app/(app)/layout.tsx without the server/Prisma data loading
// (the store is hydrated in main.tsx instead).
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-3 sm:px-6 lg:pb-10">
        {children}
      </main>
      <BottomNav />
      <TransactionModal />
    </div>
  );
}

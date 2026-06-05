import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'next-themes';

import '@/app/globals.css';

import { useFinanceStore } from '@/store/useFinanceStore';
import { usePath } from './router';
import { generateSeed } from './seed';
import { loadTransactions, saveTransactions } from './persist';
import AppShell from './AppShell';

import Landing from '@/app/page';
import DashboardPage from '@/app/(app)/dashboard/page';
import TransactionsPage from '@/app/(app)/transactions/page';
import ReportsPage from '@/app/(app)/reports/page';
import RecurringPage from '@/app/(app)/recurring/page';

// ---- Seed / hydrate / persist the client store (always demo mode) ----
const initial = loadTransactions() ?? generateSeed();
useFinanceStore.getState().hydrate(initial, 'demo');
saveTransactions(initial);
useFinanceStore.subscribe((s) => saveTransactions(s.transactions));

const ROUTES: Record<string, React.ComponentType> = {
  '/dashboard': DashboardPage,
  '/transactions': TransactionsPage,
  '/reports': ReportsPage,
  '/recurring': RecurringPage,
};

function App() {
  const path = usePath();

  if (path === '/' || path === '') {
    return <Landing />;
  }

  const Page = ROUTES[path] ?? DashboardPage;
  return (
    <AppShell>
      <Page />
    </AppShell>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

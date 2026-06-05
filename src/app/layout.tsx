import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DollarMemo — Personal Finance, Reimagined',
  description:
    'DollarMemo is a premium personal finance dashboard. Track income & expenses, analyze spending, manage subscriptions, and generate statements.',
  keywords: ['finance', 'budgeting', 'expense tracker', 'fintech', 'dashboard'],
};

export const viewport: Viewport = {
  themeColor: '#14a085',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

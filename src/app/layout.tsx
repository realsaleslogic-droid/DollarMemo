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
        {/* Apply the saved accent (incl. the browser-chrome theme color) before
            paint to avoid a flash of the default teal. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var a=localStorage.getItem('dm-accent');if(a){document.documentElement.setAttribute('data-accent',a);var s={teal:'#14a085',indigo:'#6366f1',blue:'#3b82f6',violet:'#8b5cf6',pink:'#ec4899',amber:'#f59e0b'}[a];if(s){var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.setAttribute('content',s);}}}catch(e){}})();",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

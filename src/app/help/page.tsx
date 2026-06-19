import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = { title: 'Help & FAQ · DollarMemo' };

const FAQS: { q: string; a: string }[] = [
  {
    q: 'What is DollarMemo?',
    a: 'DollarMemo is a personal finance app that brings your spending into one place. Connect a bank account to sync transactions automatically, or add them by hand — then see clear dashboards, reports, and a calendar of your recurring payments.',
  },
  {
    q: 'How do I connect my bank, and is it safe?',
    a: 'Go to the Accounts page and click “Connect bank.” Linking is handled by Stripe (Stripe Financial Connections), a trusted payments company. You enter your bank login directly with Stripe — DollarMemo never sees or stores your bank password. We only receive your transactions so we can show and categorize them.',
  },
  {
    q: 'How are my transactions categorized?',
    a: 'Every synced transaction is automatically sorted into a category (Food, Transportation, Subscriptions, and so on) by reading the merchant and the bank’s description. If something lands in the wrong category, just edit it — DollarMemo remembers your choice and categorizes that merchant the same way from then on.',
  },
  {
    q: 'A transaction is in the wrong category. How do I fix it?',
    a: 'Open the transaction, change its category, and save. That correction is remembered, so future charges from the same merchant use your category automatically.',
  },
  {
    q: 'How far back does my history go?',
    a: 'When you first link a bank, DollarMemo pulls in up to the last 6 months of transactions, depending on how much history your bank shares. New transactions then sync going forward.',
  },
  {
    q: 'What’s the difference between Free and Pro?',
    a: 'Free includes everything in the app with one connected bank. Pro lets you connect up to 5 banks at once. You can upgrade anytime from the Upgrade page, and cancel whenever you like.',
  },
  {
    q: 'How do I cancel or manage my subscription?',
    a: 'Open the Upgrade page and click “Manage billing.” That opens Stripe’s secure portal where you can update your payment method, switch plans, or cancel. Canceling keeps Pro active until the end of your billing period.',
  },
  {
    q: 'Is my data private, and can I export it?',
    a: 'Your data is tied to your account and only visible to you. You can export your full transaction history as a CSV from the Transactions page. See our Privacy Policy for the details.',
  },
  {
    q: 'How do I change my currency, name, or theme?',
    a: 'Head to Settings to update your personal info, pick a currency, and choose your accent color. You can switch between light and dark mode anytime with the toggle in the top bar.',
  },
];

export default function HelpPage() {
  return (
    <div className="app-bg min-h-screen">
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-9 w-9" />
            <span className="text-lg font-extrabold tracking-tight">DollarMemo</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            <ArrowLeft size={15} /> Back
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Help &amp; FAQ</h1>
          <p className="mt-2 text-sm text-ink-soft">Answers to common questions about DollarMemo.</p>

          <div className="mt-6 divide-y divide-line">
            {FAQS.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold transition hover:text-brand-600 dark:hover:text-brand-300">
                  {item.q}
                  <span className="shrink-0 text-ink-soft transition group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { HelpCircle } from 'lucide-react';
import Topbar from '@/components/Topbar';

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
    q: 'Can I connect a credit card?',
    a: 'Not right now — DollarMemo links bank accounts only. You can still track card spending by adding those transactions manually from the Add Transaction button.',
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
    a: 'When you first link a bank, DollarMemo pulls in up to the last 12 months of transactions, depending on how much history your bank shares. New transactions then sync going forward.',
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
    a: 'Your data is tied to your account and only visible to you. You can export your full transaction history as a CSV from the Transactions page. See our Privacy Policy (linked in Settings) for the details.',
  },
  {
    q: 'How do I change my currency, name, or theme?',
    a: 'Head to Settings to update your personal info, pick a currency, and choose your accent color. You can switch between light and dark mode anytime with the toggle in the top bar.',
  },
];

export default function HelpPage() {
  return (
    <>
      <Topbar title="Help & FAQ" subtitle="Answers to common questions" />

      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card flex items-start gap-3 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-500/15 text-brand-600">
            <HelpCircle size={20} />
          </span>
          <div>
            <h3 className="font-bold">How can we help?</h3>
            <p className="text-sm text-ink-soft">
              Browse the questions below. Tap any one to see the answer.
            </p>
          </div>
        </div>

        <div className="card divide-y divide-line overflow-hidden p-0">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold transition hover:text-brand-600 dark:hover:text-brand-300">
                {item.q}
                <span className="shrink-0 text-ink-soft transition group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}

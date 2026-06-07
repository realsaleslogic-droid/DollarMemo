import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = { title: 'Privacy Policy · DollarMemo' };

const UPDATED = 'June 5, 2026';
const CONTACT = 'dollarmemoapp@gmail.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="app-bg min-h-screen">
      <div className="relative z-10 mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-9 w-9" />
            <span className="text-lg font-extrabold tracking-tight">DollarMemo</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            <ArrowLeft size={15} /> Back to app
          </Link>
        </div>

        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-ink-soft">Last updated: {UPDATED}</p>

          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            This Privacy Policy explains how DollarMemo (&ldquo;DollarMemo&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
            collects, uses, and protects your information when you use our personal finance application (the
            &ldquo;Service&rdquo;). By using the Service, you agree to the practices described here.
          </p>

          <Section title="1. Information we collect">
            <p>We collect only what we need to run the Service:</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <strong className="text-ink">Account information.</strong> When you create an account, we collect your
                email address and display name through our authentication provider, Supabase.
              </li>
              <li>
                <strong className="text-ink">Financial data you add.</strong> Transactions, categories, amounts, notes,
                and recurring-payment details you enter or import.
              </li>
              <li>
                <strong className="text-ink">Connected accounts (optional).</strong> If you link a bank or card, our
                provider Stripe collects your account transactions and balances on our behalf. Your bank login
                credentials are entered with Stripe and are never seen by or stored on DollarMemo.
              </li>
              <li>
                <strong className="text-ink">Preferences.</strong> Settings such as your chosen accent color and display
                currency, stored locally in your browser.
              </li>
              <li>
                <strong className="text-ink">Technical data.</strong> Basic, standard server and security logs generated
                by our hosting provider.
              </li>
            </ul>
          </Section>

          <Section title="2. Demo mode">
            <p>
              If you use &ldquo;Try the demo&rdquo; without an account, the sample data is generated and stored only in
              your browser&rsquo;s local storage. It is never sent to our servers and is not associated with any
              account.
            </p>
          </Section>

          <Section title="3. How we use your information">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>To provide the Service: store, display, categorize, and analyze your transactions.</li>
              <li>To authenticate you and keep your account secure.</li>
              <li>To sync and categorize transactions from accounts you choose to connect.</li>
              <li>To maintain, troubleshoot, and improve the Service.</li>
            </ul>
            <p>
              We do <strong className="text-ink">not</strong> sell your personal or financial information, and we do not
              use it for advertising.
            </p>
          </Section>

          <Section title="4. Service providers we share data with">
            <p>We share data only with the providers needed to operate the Service:</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>
                <strong className="text-ink">Supabase</strong> — authentication and database (stores your account and
                transactions).
              </li>
              <li>
                <strong className="text-ink">Stripe</strong> — secure connection to your financial institutions (only if
                you choose to link an account).
              </li>
              <li>
                <strong className="text-ink">Vercel</strong> — application hosting and delivery.
              </li>
            </ul>
            <p>
              Each provider processes data under its own privacy and security terms. We may also disclose information if
              required by law.
            </p>
          </Section>

          <Section title="5. How your data is protected">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>Your records are isolated per user with database row-level security, so you can only access your own data.</li>
              <li>Connections to the Service are encrypted in transit (HTTPS).</li>
              <li>Access tokens for linked financial accounts are encrypted and stored server-side only.</li>
            </ul>
            <p>
              No method of transmission or storage is 100% secure, but we work to protect your information using
              industry-standard measures.
            </p>
          </Section>

          <Section title="6. Data retention">
            <p>
              We keep your account and financial data for as long as your account is active. When you delete a
              transaction or unlink an institution, that data is removed from our active systems. You may request
              deletion of your account and associated data at any time (see Contact).
            </p>
          </Section>

          <Section title="7. Your rights & choices">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>Access, edit, or delete your transactions directly in the app.</li>
              <li>Unlink any connected financial account at any time from the Accounts page.</li>
              <li>Request a copy or deletion of your personal data by contacting us.</li>
              <li>Reset your password from the login page.</li>
            </ul>
            <p>
              Depending on where you live, you may have additional rights under laws such as the GDPR or CCPA. Contact us
              to exercise them.
            </p>
          </Section>

          <Section title="8. Cookies & local storage">
            <p>
              We use cookies and local storage only for essential functionality — keeping you signed in, remembering
              your appearance and currency preferences, and enabling demo mode. We do not use third-party advertising or
              tracking cookies.
            </p>
          </Section>

          <Section title="9. Children's privacy">
            <p>
              The Service is not intended for anyone under 16, and we do not knowingly collect personal information from
              children.
            </p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last
              updated&rdquo; date above. Continued use of the Service after changes take effect constitutes acceptance of
              the updated policy.
            </p>
          </Section>

          <Section title="11. Contact us">
            <p>
              Questions about this policy or your data? Reach us at{' '}
              <a href={`mailto:${CONTACT}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                {CONTACT}
              </a>
              .
            </p>
          </Section>

          <p className="mt-8 rounded-xl bg-surface-2 px-4 py-3 text-xs text-ink-soft">
            This document is provided as a general template for DollarMemo and is not legal advice. Please review it with
            a qualified professional and update the contact details to fit your specific use and jurisdiction.
          </p>
        </div>
      </div>
    </div>
  );
}

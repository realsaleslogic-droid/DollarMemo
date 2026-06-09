import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export const metadata: Metadata = { title: 'Terms of Service · DollarMemo' };

const UPDATED = 'June 7, 2026';
const CONTACT = 'dollarmemoapp@gmail.com';
const JURISDICTION = 'the United States'; // update to your state/country

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-ink-soft">Last updated: {UPDATED}</p>

          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of DollarMemo (the
            &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these Terms. If you do not
            agree, do not use the Service.
          </p>

          <Section title="1. The service">
            <p>
              DollarMemo is a personal finance dashboard that helps you track, categorize, and analyze your income and
              spending. You can enter transactions manually, or optionally connect a bank or credit-card account to
              import them automatically.
            </p>
          </Section>

          <Section title="2. Not financial, legal, or tax advice">
            <p>
              DollarMemo is an informational tool only. It is <strong className="text-ink">not</strong> a bank, lender,
              broker, or financial advisor, and nothing in the Service constitutes financial, investment, legal, or tax
              advice. Figures, categories, charts, and recurring-payment detections are provided for convenience, may be
              incomplete, delayed, or inaccurate, and should not be solely relied upon to make financial decisions.
              Always verify important information with your financial institution.
            </p>
          </Section>

          <Section title="3. Eligibility & accounts">
            <ul className="ml-5 list-disc space-y-1.5">
              <li>You must be at least 16 years old to use the Service.</li>
              <li>You are responsible for the information you provide and for activity under your account.</li>
              <li>
                Keep your login credentials secure. Notify us promptly at{' '}
                <a href={`mailto:${CONTACT}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                  {CONTACT}
                </a>{' '}
                if you suspect unauthorized access.
              </li>
            </ul>
          </Section>

          <Section title="4. Connecting financial accounts">
            <p>
              If you choose to link a bank account, that connection is handled by our provider <strong className="text-ink">Stripe</strong>{' '}
              (Stripe Financial Connections). You authorize DollarMemo and Stripe to access and import your account and
              transaction information for the purpose of providing the Service. Your bank credentials are entered with
              Stripe and are never seen or stored by DollarMemo. Your use of that connection is also subject to
              Stripe&rsquo;s terms and your financial institution&rsquo;s terms. You can unlink an account at any time
              from the Accounts page.
            </p>
          </Section>

          <Section title="5. Acceptable use">
            <p>You agree not to:</p>
            <ul className="ml-5 list-disc space-y-1.5">
              <li>Use the Service for any unlawful, fraudulent, or unauthorized purpose.</li>
              <li>Access another person&rsquo;s account or data without authorization.</li>
              <li>Interfere with, disrupt, probe, or attempt to gain unauthorized access to the Service or its systems.</li>
              <li>Reverse engineer, scrape, or build a competing product using the Service, except as permitted by law.</li>
              <li>Upload malicious code or misuse the Service in a way that could harm DollarMemo or other users.</li>
            </ul>
          </Section>

          <Section title="6. Your data & content">
            <p>
              You retain ownership of the financial data and content you add to or import into the Service. You grant
              DollarMemo a limited license to store and process that data solely to operate and provide the Service to
              you. How we handle your data is described in our{' '}
              <Link href="/privacy" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>

          <Section title="7. Intellectual property">
            <p>
              The Service, including its software, design, and branding, is owned by DollarMemo and protected by
              applicable laws. These Terms do not grant you any right to use our names, logos, or trademarks without our
              prior written permission.
            </p>
          </Section>

          <Section title="8. Third-party services">
            <p>
              The Service relies on third-party providers (including Stripe, Supabase, and our hosting provider). We are
              not responsible for the availability, accuracy, or practices of third-party services, and your use of them
              may be subject to their own terms.
            </p>
          </Section>

          <Section title="9. Disclaimer of warranties">
            <p>
              The Service is provided <strong className="text-ink">&ldquo;as is&rdquo;</strong> and{' '}
              <strong className="text-ink">&ldquo;as available&rdquo;</strong>, without warranties of any kind, whether
              express or implied, including merchantability, fitness for a particular purpose, accuracy, and
              non-infringement. We do not warrant that the Service will be uninterrupted, error-free, secure, or that
              imported data will be complete or accurate.
            </p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>
              To the maximum extent permitted by law, DollarMemo and its operators will not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or for any loss of profits, data, or financial
              loss, arising out of or related to your use of (or inability to use) the Service — even if advised of the
              possibility. To the extent liability cannot be excluded, it is limited to the amount you paid us (if any)
              for the Service in the 12 months before the claim.
            </p>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify and hold harmless DollarMemo and its operators from any claims, damages, or expenses
              arising from your misuse of the Service or violation of these Terms.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              You may stop using the Service and delete your account at any time. We may suspend or terminate your access
              if you violate these Terms or use the Service in a way that could cause harm or legal liability. Upon
              termination, your right to use the Service ends; sections that by their nature should survive (such as
              disclaimers and limitation of liability) will continue to apply.
            </p>
          </Section>

          <Section title="13. Changes to the service or terms">
            <p>
              We may modify or discontinue features of the Service, and we may update these Terms from time to time. When
              we make material changes, we will update the &ldquo;Last updated&rdquo; date above. Your continued use of
              the Service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="14. Governing law">
            <p>
              These Terms are governed by the laws of {JURISDICTION}, without regard to its conflict-of-laws rules. Any
              disputes will be subject to the courts located there, unless applicable law requires otherwise.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href={`mailto:${CONTACT}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                {CONTACT}
              </a>
              .
            </p>
          </Section>

          <p className="mt-8 rounded-xl bg-surface-2 px-4 py-3 text-xs text-ink-soft">
            This document is provided as a general template for DollarMemo and is not legal advice. Please review it with
            a qualified professional, set the governing-law location to your jurisdiction, and adjust it to fit your
            specific use.
          </p>
        </div>
      </div>
    </div>
  );
}

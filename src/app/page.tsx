import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Repeat,
  FileDown,
  PlayCircle,
  Landmark,
  Sparkles,
  Lock,
} from 'lucide-react';
import HeroCharacter from '@/components/HeroCharacter';
import BrandLogo from '@/components/BrandLogo';
import DemoButton from '@/components/DemoButton';

const FEATURES = [
  {
    icon: Landmark,
    title: 'Connect your bank',
    desc: 'Securely link a bank or credit card with Stripe — your transactions sync in automatically.',
    highlight: true,
  },
  {
    icon: Sparkles,
    title: 'Auto-categorized',
    desc: 'Every transaction is cleaned up, matched to its logo, and sorted into the right category — no manual tagging.',
    highlight: true,
  },
  {
    icon: BarChart3,
    title: 'Live analytics',
    desc: 'Spending by category, trends and net cash flow update in real time.',
  },
  {
    icon: Repeat,
    title: 'Subscription radar',
    desc: 'Auto-detects recurring payments and projects your annual cost.',
  },
  {
    icon: FileDown,
    title: 'Statements',
    desc: 'Export polished CSV & PDF financial statements in one click.',
  },
  {
    icon: ShieldCheck,
    title: 'Private & secure',
    desc: 'Bank logins never touch us. Your data is tied to your account — yours alone.',
  },
];

// Tiny mock for the floating "auto-categorized" preview card.
const PREVIEW = [
  { merchant: 'Whole Foods', category: 'Food', color: '#f4715f', amount: '-$84.20', tone: 'text-expense' },
  { merchant: 'Apple', category: 'Shopping', color: '#f59e0b', amount: '-$12.99', tone: 'text-expense' },
  { merchant: 'Payroll', category: 'Income', color: '#16b981', amount: '+$3,200', tone: 'text-income' },
];

export default function Landing() {
  return (
    <div className="app-bg relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Nav */}
        <header className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-10 w-10" />
            <span className="text-xl font-extrabold tracking-tight">DollarMemo</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">Log in</Link>
            <Link href="/signup" className="btn-primary hidden sm:inline-flex">Sign up</Link>
          </div>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
          <div className="animate-fade-up">
            <span className="stat-pill gap-1.5 bg-brand-500/10 text-brand-700 dark:text-brand-300">
              <Sparkles size={13} /> Now with automatic bank sync
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Spend smarter.<br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">Save more.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              Connect your bank or card and DollarMemo automatically tracks, names, and
              <span className="font-semibold text-ink"> categorizes every transaction</span> — turning
              your spending into beautiful, real-time insights.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: Lock, label: 'Secured by Stripe' },
                { icon: Sparkles, label: 'Auto-categorized' },
                { icon: ShieldCheck, label: 'Your data stays yours' },
              ].map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur"
                >
                  <b.icon size={13} className="text-brand-600 dark:text-brand-300" /> {b.label}
                </span>
              ))}
            </div>

            {/* Primary actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn-primary text-base">
                Create free account <ArrowRight size={18} />
              </Link>
              <DemoButton className="btn-ghost text-base">
                <PlayCircle size={18} /> Try the demo
              </DemoButton>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-sm text-ink-soft sm:flex-row sm:items-center sm:gap-2">
              <span>
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                  Log in
                </Link>
              </span>
              <span className="hidden text-ink-soft/50 sm:inline">·</span>
              <span>No sign-up needed to explore the demo</span>
            </div>
          </div>

          {/* Hero mascot + floating preview */}
          <div className="relative h-[360px] sm:h-[440px]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-brand-radial opacity-90 shadow-glow" />
            <HeroCharacter className="absolute inset-0" />

            {/* Floating "auto-categorized" card */}
            <div className="obj-bob-a absolute -bottom-4 left-1/2 w-[20rem] max-w-[88%] -translate-x-1/2 sm:left-auto sm:right-2 sm:translate-x-0">
              <div className="glass rounded-2xl p-3 shadow-card-lg">
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  <Sparkles size={12} className="text-brand-600 dark:text-brand-300" /> Auto-categorized
                </div>
                <div className="space-y-1">
                  {PREVIEW.map((t) => (
                    <div key={t.merchant} className="flex items-center gap-3 rounded-xl bg-surface/70 px-2.5 py-2">
                      <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `${t.color}22` }}>
                        <span className="grid h-full w-full place-items-center text-xs font-bold" style={{ color: t.color }}>
                          {t.merchant[0]}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">{t.merchant}</p>
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 text-[10px] font-medium"
                          style={{ background: `${t.color}1f`, color: t.color }}
                        >
                          {t.category}
                        </span>
                      </div>
                      <p className={`text-xs font-bold tabular-nums ${t.tone}`}>{t.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="pb-10 pt-6">
          <h2 className="mb-1 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
            Everything your money needs
          </h2>
          <p className="mb-8 text-center text-ink-soft">From bank sync to beautiful reports — all in one place.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
              >
                {f.highlight && (
                  <span className="absolute right-3 top-3 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                    New
                  </span>
                )}
                <span
                  className={
                    f.highlight
                      ? 'grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow'
                      : 'grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-300'
                  }
                >
                  <f.icon size={22} />
                </span>
                <h3 className="mt-4 font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-center text-white shadow-glow sm:px-10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-8 h-44 w-44 rounded-full bg-black/10 blur-2xl" />
            <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-4xl">
              See exactly where your money goes.
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/85">
              Connect an account in seconds, or explore the live demo first. No spreadsheets, no manual tagging.
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-base font-bold text-brand-700 transition hover:bg-white/90"
              >
                Create free account <ArrowRight size={18} />
              </Link>
              <DemoButton className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-base font-bold text-white transition hover:bg-white/10">
                <PlayCircle size={18} /> Try the demo
              </DemoButton>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Landmark, FileDown, PlayCircle } from 'lucide-react';
import HeroCharacter from '@/components/HeroCharacter';
import BrandLogo from '@/components/BrandLogo';
import DemoButton from '@/components/DemoButton';

const FEATURES = [
  { icon: BarChart3, title: 'Live analytics', desc: 'Spending by category, trends and net cash flow update in real time.' },
  { icon: Landmark, title: 'Connect your bank', desc: 'Securely link a bank and sync your transactions in automatically — tracked and categorized for you.' },
  { icon: FileDown, title: 'Statements', desc: 'Export polished CSV & PDF financial statements in one click.' },
  { icon: ShieldCheck, title: 'Private & secure', desc: 'Bank connections are handled by Stripe — your bank login is never seen or stored. Your data is yours alone.' },
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
        <section className="grid items-center gap-8 py-10 lg:grid-cols-2 lg:py-16">
          <div className="animate-fade-up">
            <span className="stat-pill bg-brand-500/10 text-brand-700 dark:text-brand-300">
              ● Personal finance, reimagined
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Spend smarter.<br />
              <span className="bg-brand-gradient bg-clip-text text-transparent">Save more.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              Track income & expenses, analyze your habits, tame subscriptions, and generate
              statements — all in one beautiful dashboard.
            </p>

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

          {/* Hero mascot */}
          <div className="relative h-[320px] sm:h-[420px]">
            <div className="absolute inset-0 rounded-[2.5rem] bg-brand-radial opacity-90 shadow-glow" />
            <HeroCharacter className="absolute inset-0" />
          </div>
        </section>

        {/* Feature grid */}
        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center gap-4 border-t border-line py-8 text-sm text-ink-soft sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} DollarMemo</p>
          <nav className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-ink">
              Terms
            </Link>
            <Link href="/help" className="transition hover:text-ink">
              Help &amp; FAQ
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

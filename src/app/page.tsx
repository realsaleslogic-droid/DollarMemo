import Link from 'next/link';
import { ArrowRight, BarChart3, ShieldCheck, Landmark, FileDown, PlayCircle, Lock, Sparkles } from 'lucide-react';
import HeroCharacter from '@/components/HeroCharacter';
import BrandLogo from '@/components/BrandLogo';
import DemoButton from '@/components/DemoButton';

const FEATURES = [
  { icon: BarChart3, title: 'Live analytics', desc: 'Spending by category, trends and net cash flow update in real time.' },
  { icon: Landmark, title: 'Connect your bank', desc: 'Securely link a bank and sync your transactions in automatically — tracked and categorized for you.' },
  { icon: FileDown, title: 'Statements', desc: 'Export polished CSV & PDF financial statements in one click.' },
  { icon: ShieldCheck, title: 'Private & secure', desc: 'Your data is tied to your account — yours alone.' },
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

            {/* Trust strip */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} className="text-brand-600 dark:text-brand-300" /> Bank-grade encryption
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Landmark size={14} className="text-brand-600 dark:text-brand-300" /> Powered by Stripe
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-600 dark:text-brand-300" /> Free to start
              </span>
            </div>
          </div>

          {/* Hero mascot */}
          <div className="relative h-[320px] sm:h-[420px]">
            <div className="hero-glow absolute inset-0 rounded-[2.5rem] bg-brand-radial opacity-90 shadow-glow" />
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-white/15" />
            <HeroCharacter className="absolute inset-0" />
          </div>
        </section>

        {/* Feature grid */}
        <section className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="glass group animate-fade-up relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-card-lg"
              style={{ animationDelay: `${0.15 + i * 0.08}s`, animationFillMode: 'both' }}
            >
              {/* accent line that lights up on hover */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                <f.icon size={20} />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

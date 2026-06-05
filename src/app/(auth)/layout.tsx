import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg relative grid min-h-screen place-items-center px-4 py-10">
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-gradient text-white shadow-glow">$</span>
          <span className="text-xl font-extrabold tracking-tight">FlowTrack</span>
        </Link>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

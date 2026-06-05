import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg relative grid min-h-screen place-items-center px-4 py-10">
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <BrandLogo className="h-10 w-10" />
          <span className="text-xl font-extrabold tracking-tight">DollarMemo</span>
        </Link>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

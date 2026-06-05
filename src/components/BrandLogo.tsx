import { cn } from '@/lib/utils';

/**
 * DollarMemo brand mark — a stack of memo/receipt sheets with a folded corner
 * and a dollar sign. Self-contained SVG (own mint tile + colors) so it reads
 * consistently in both light and dark mode. Size it via className (h-/w-).
 */
export default function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      role="img"
      aria-label="DollarMemo logo"
    >
      {/* mint tile backdrop */}
      <rect width="64" height="64" rx="16" fill="#dcf0e8" />

      <g
        transform="rotate(8 32 32)"
        fill="#dcf0e8"
        stroke="#14463f"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* back sheet (peeks out lower-left) */}
        <path d="M21 24 H38 A3 3 0 0 1 41 27 V47 A3 3 0 0 1 38 50 H21 A3 3 0 0 1 18 47 V27 A3 3 0 0 1 21 24 Z" />
        {/* front sheet with a folded top-right corner */}
        <path d="M28 13 H38 L45 20 V43 A3 3 0 0 1 42 46 H25 A3 3 0 0 1 22 43 V16 A3 3 0 0 1 25 13 Z" />
        {/* folded corner accent */}
        <path d="M38 13 L45 20 H38 Z" fill="#5cc3ac" />
        {/* dollar sign */}
        <text
          x="33.5"
          y="39"
          textAnchor="middle"
          fontSize="25"
          fontWeight="800"
          fontFamily="var(--font-sans), system-ui, sans-serif"
          fill="#14463f"
          stroke="none"
        >
          $
        </text>
      </g>
    </svg>
  );
}

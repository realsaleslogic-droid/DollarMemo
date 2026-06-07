'use client';

import { useState } from 'react';
import { Landmark } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import { brandFor, brandLogoUrl, faviconUrl, isTransfer } from '@/lib/brands';
import { cn } from '@/lib/utils';

/**
 * Avatar for a transaction/merchant. If the merchant is a recognizable brand,
 * it shows the company logo; otherwise (or if the logo fails to load) it falls
 * back to the generic category icon. Logo sources are tried in order:
 * brand logo CDN -> favicon -> category icon.
 */
export default function MerchantAvatar({
  merchant,
  category,
  className,
  size = 20,
}: {
  merchant: string;
  category: string;
  className?: string;
  size?: number;
}) {
  const brand = brandFor(merchant);
  const sources = brand ? [brandLogoUrl(brand.domain), faviconUrl(brand.domain)] : [];
  const [srcIndex, setSrcIndex] = useState(0);

  // No brand match, or every logo source failed.
  if (!brand || srcIndex >= sources.length) {
    // Transfers with no recognizable bank -> a generic bank icon.
    if (isTransfer(merchant)) {
      return (
        <span className={cn('grid place-items-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300', className)}>
          <Landmark size={size} />
        </span>
      );
    }
    return <CategoryIcon category={category} className={className} size={size} />;
  }

  return (
    <span
      className={cn('grid place-items-center overflow-hidden rounded-xl bg-white dark:bg-white/90', className)}
      style={brand.color ? { boxShadow: `inset 0 0 0 1px ${brand.color}26` } : undefined}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[srcIndex]}
        alt={merchant}
        className="h-[62%] w-[62%] object-contain"
        loading="lazy"
        onError={() => setSrcIndex((i) => i + 1)}
      />
    </span>
  );
}

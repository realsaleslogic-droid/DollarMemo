'use client';

import {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Clapperboard,
  Lightbulb,
  Home,
  HeartPulse,
  Repeat,
  TrendingUp,
  Boxes,
  type LucideIcon,
} from 'lucide-react';
import { CATEGORY_MAP, categoryColor } from '@/lib/categories';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Clapperboard,
  Lightbulb,
  Home,
  HeartPulse,
  Repeat,
  TrendingUp,
  Boxes,
};

export default function CategoryIcon({
  category,
  className,
  size = 18,
}: {
  category: string;
  className?: string;
  size?: number;
}) {
  const meta = CATEGORY_MAP[category];
  const Icon = ICONS[meta?.icon ?? 'Boxes'] ?? Boxes;
  const color = categoryColor(category);
  return (
    <span
      className={cn('grid place-items-center rounded-xl', className)}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon size={size} strokeWidth={2.2} />
    </span>
  );
}

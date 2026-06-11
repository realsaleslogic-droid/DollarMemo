'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { formatMoney } from '@/lib/format';

/**
 * A money figure that smoothly counts up to its value when it first appears (and
 * re-animates when the value changes). Falls back to the static figure when the
 * user prefers reduced motion. Uses tabular figures upstream to avoid jitter.
 */
export default function AnimatedMoney({
  value,
  className,
  duration = 0.9,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => formatMoney(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, duration, reduce, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}

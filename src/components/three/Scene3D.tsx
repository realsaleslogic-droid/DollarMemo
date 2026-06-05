'use client';

import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';

// three.js can't render on the server — load the canvas client-side only.
const FloatingCoins = dynamic(() => import('./FloatingCoins'), {
  ssr: false,
  loading: () => null,
});

export default function Scene3D({ className }: { className?: string }) {
  return (
    <div className={className}>
      {/* If WebGL is unavailable the gradient backdrop shows through. */}
      <ErrorBoundary fallback={null}>
        <FloatingCoins />
      </ErrorBoundary>
    </div>
  );
}

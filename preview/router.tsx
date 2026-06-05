// Minimal hash-based router for the standalone single-file preview.
// Backs the next/link and next/navigation shims so the real app components
// work unchanged.
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function currentPath(): string {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

function emit() {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', emit);
}

export function navigate(to: string) {
  const path = to.startsWith('#') ? to.slice(1) : to;
  if (currentPath() === path) return;
  window.location.hash = path;
  // hashchange fires async; emit immediately for snappy UI
  emit();
}

export function usePath(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    currentPath,
    () => '/'
  );
}

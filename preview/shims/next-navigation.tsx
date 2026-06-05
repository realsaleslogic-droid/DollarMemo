import { navigate, usePath } from '../router';

// Subset of next/navigation used by the app, backed by the hash router.
export function usePathname(): string {
  return usePath();
}

export function useRouter() {
  return {
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to),
    back: () => window.history.back(),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function useSearchParams() {
  return new URLSearchParams();
}

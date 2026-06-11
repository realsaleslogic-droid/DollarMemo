/**
 * Re-mounts on every route change inside the app shell, giving each page a
 * gentle fade-up entrance (CSS-only, 6px / 0.35s — felt, not seen). Pages keep
 * their own internal animations; this just smooths the switch between them.
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="motion-safe:animate-page-in">{children}</div>;
}

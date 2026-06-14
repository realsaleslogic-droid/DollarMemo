// Shared cookie settings for the Supabase auth session. Note: @supabase/ssr
// already defaults the auth cookie to a 400-day maxAge (and overrides this
// value), so persistence is handled by the library — the real "stay logged in"
// fix is in middleware.ts (carrying refreshed cookies through redirects). This
// is kept as a harmless, explicit declaration of intent. 400 days is the max
// modern browsers (Chrome 104+) honor.
export const AUTH_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 400,
} as const;

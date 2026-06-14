// Shared cookie settings for the Supabase auth session. Without an explicit
// maxAge the session token is stored as a *session cookie*, which mobile
// browsers (and "clear on close" settings) drop when the tab/app closes — so a
// returning user has to log in again. A long maxAge makes the login persist
// across tab close, browser restart, and app switches, on phone and desktop.
// 400 days is the maximum modern browsers (Chrome 104+) will honor.
export const AUTH_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24 * 400,
} as const;

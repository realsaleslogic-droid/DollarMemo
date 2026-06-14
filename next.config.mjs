// Conservative security headers (safe, non-CSP). They harden against
// clickjacking, MIME sniffing, referrer leakage, and force HTTPS.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

// The canonical public domain. Everything served from the raw Vercel domain is
// redirected here so the address bar stays on dollarmemo.com AND the login
// session cookie is always set on this one domain (a cookie set on
// *.vercel.app wouldn't be sent when the user returns via dollarmemo.com,
// which reads as "logged out").
const CANONICAL_HOST = 'dollarmemo.com';
const VERCEL_HOST = 'dollarmemo.vercel.app';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships ESM that benefits from transpilation through Next.
  transpilePackages: ['three'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: VERCEL_HOST }],
        destination: `https://${CANONICAL_HOST}/:path*`,
        permanent: false, // 307 — keep cache-soft while the domain settles
      },
    ];
  },
};

export default nextConfig;

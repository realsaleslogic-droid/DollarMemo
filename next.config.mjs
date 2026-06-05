/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships ESM that benefits from transpilation through Next.
  transpilePackages: ['three'],
};

export default nextConfig;

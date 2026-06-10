/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // fpl-api and javascript-lp-solver run only in server routes/components.
  experimental: {
    serverComponentsExternalPackages: ["fpl-api", "javascript-lp-solver"],
  },
};

export default nextConfig;

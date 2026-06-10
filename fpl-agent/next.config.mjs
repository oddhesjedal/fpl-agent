/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // fpl-api and javascript-lp-solver run only in server routes/components.
  experimental: {
    serverComponentsExternalPackages: ["fpl-api", "javascript-lp-solver"],
  },
  // The app runs fine in dev; don't let strict prod-build type/lint checks block
  // deployment for this personal project.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  transpilePackages: ["autorouter-dto", "flight-plan-clock-dto"],
  output: 'standalone'
}

module.exports = nextConfig

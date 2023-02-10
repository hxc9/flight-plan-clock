/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.experiments.topLevelAwait = true
    return config
  },
  reactStrictMode: true,
  transpilePackages: ["autorouter-dto", "autorouter-mock-services"]
}

module.exports = nextConfig

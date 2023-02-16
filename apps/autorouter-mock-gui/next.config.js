/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_AR_MOCK_GUI_BASE_PATH??'',
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.experiments.topLevelAwait = true
    return config
  },
  reactStrictMode: true,
  transpilePackages: ["autorouter-dto", "autorouter-mock-services"],
  output: 'standalone',
}

module.exports = nextConfig

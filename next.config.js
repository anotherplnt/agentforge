/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false, child_process: false };
    // Exclude hardhat from client bundles
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        hardhat: false,
      };
    }
    config.externals = [...(config.externals || []), 'hardhat'];
    return config;
  },
};

module.exports = nextConfig;

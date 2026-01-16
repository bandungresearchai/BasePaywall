/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    // Alias react-native async storage to a small browser stub to avoid
    // pulling native dependencies into the Next.js web bundle.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@react-native-async-storage/async-storage': require('path').resolve(__dirname, 'mocks/emptyAsyncStorage.js'),
    };

    // Optional: when NEXT_PUBLIC_STUB_WAGMI=1, alias `wagmi` to a lightweight
    // client-side stub to make automated E2E tests deterministic.
    if (process.env.NEXT_PUBLIC_STUB_WAGMI === '1') {
      config.resolve.alias['wagmi'] = require('path').resolve(__dirname, 'mocks/wagmiStubClient.js');
    }
    return config;
  },
};

module.exports = nextConfig;

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
    return config;
  },
};

module.exports = nextConfig;

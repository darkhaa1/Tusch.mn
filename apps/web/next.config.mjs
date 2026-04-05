import createNextIntlPlugin from 'next-intl/plugin';
import BundleAnalyzer from '@next/bundle-analyzer';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Derive image hostname from the API URL so next/image can optimise
// images served by the backend (uploads).
function buildRemotePatterns() {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3310';
  try {
    const url = new URL(raw);
    return [
      {
        protocol: /** @type {'http'|'https'} */ (url.protocol.replace(':', '')),
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: '/uploads/**',
      },
    ];
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: '../..',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    remotePatterns: buildRemotePatterns(),
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
